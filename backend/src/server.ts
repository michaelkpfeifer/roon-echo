import http from 'http';

import Bottleneck from 'bottleneck';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import knexInit from 'knex';
import type { Knex } from 'knex';
import fp from 'lodash/fp.js';
import RoonApi from 'node-roon-api';
import RoonApiBrowse from 'node-roon-api-browse';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';
import { Server } from 'socket.io';

import * as browser from './browser.js';
import {
  logChanged,
  logChangedUnknown,
  logChangedZonesAdded,
  logChangedZonesChanged,
  logChangedZonesRemoved,
  logChangedZonesSeekChanged,
  logSubscribed,
  logUnknown,
} from './logging.js';
import {
  enrichAlbumAggregatesWithMusicBrainzData,
  getAlbumAggregatesWithPersistedData,
} from './mbData.js';
import {
  frontendZonesChangedMessage,
  frontendZonesSeekChangedMessage,
} from './messages.js';
import { updatePlays } from './plays.js';
import { extractQueueItems } from './queues.js';
import {
  dbInit,
  findRoonTrackByNameAndAlbumName,
  updateRoonLengthInTrack,
} from './repository.js';
import { initializeRoonData } from './roonData.js';
import type { DatabaseSchema } from '../databaseSchema.ts';
import { RawTransportGetZonesResponseSchema } from './schemas/rawTransportGetZonesResponse.js';
import { RawZonesAddedMessageSchema } from './schemas/rawZonesAddedMessage.js';
import { RawZonesChangedMessageSchema } from './schemas/rawZonesChangedMessage.js';
import { RawZonesSeekChangedMessageSchema } from './schemas/rawZonesSeekChangedMessage.js';
import {
  transformAdditionsToZones,
  transformChangesToZones,
  transformTransportGetZones,
} from './transforms/zone.js';
import { transformToZoneSeekPositions } from './transforms/zoneSeekPosition.js';
import { camelCaseKeys } from './utils.js';
import type { PlayingQueueItems } from '../../shared/internal/playingQueueItems.js';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack.js';
import type { RoonQueueItem } from '../../shared/internal/roonQueueItem.js';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/internal/socket.js';
import type { Zone } from '../../shared/internal/zone.js';
import type { ZonePlayingState } from '../../shared/internal/zonePlayingState.js';
import type { ZoneSeekPosition } from '../../shared/internal/zoneSeekPosition.js';
import knexConfig from '../knexfile.js';

const environment = (process.env.NODE_ENV ||
  'development') as keyof typeof knexConfig;
const untypedDb = knexInit(knexConfig[environment]);
const db: Knex<DatabaseSchema> = untypedDb;

dbInit(db);

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

dotenv.config();

const coreUrlConfigured = process.env.CORE_URL;

let transport: any;
let browseInstance: InstanceType<typeof RoonApiBrowse>;

let staticZoneData: Zone[] = [];
let zonePlayingStates: ZonePlayingState[] = [];
let queueChangedMessages: { zoneId: string; queueItems: RoonQueueItem[] }[] =
  [];
const playingQueueItems: PlayingQueueItems = {};
const activeSubscriptions: Set<string> = new Set([]);

const updateRoonTrackLengths = async (queueItems: RoonQueueItem[]) => {
  for (const queueItem of queueItems) {
    const roonAlbumName = queueItem.threeLine.line3;
    const roonTrackName = queueItem.threeLine.line1;

    const tracks = await findRoonTrackByNameAndAlbumName(
      db,
      roonAlbumName,
      roonTrackName,
    );

    if (tracks.length > 1) {
      throw new Error(
        `Error: Could not uniquely identify track ${roonTrackName} on ${roonAlbumName}.`,
      );
    }

    if (tracks.length === 1) {
      const track: RoonExtendedTrack = tracks[0];
      updateRoonLengthInTrack(db, track.trackId, queueItem.length);
    }
  }
};

const updateQueueChangedMessages = (
  newMessage: { zoneId: string; queueItems: RoonQueueItem[] },
  queueChangedMessages: { zoneId: string; queueItems: RoonQueueItem[] }[],
) => {
  return [
    ...queueChangedMessages.filter((msg) => msg.zoneId !== newMessage.zoneId),
    newMessage,
  ];
};

const subscribeToQueueChanges = (zoneIds: string[]) => {
  zoneIds.forEach((zoneId: string) => {
    if (activeSubscriptions.has(zoneId)) {
      return null;
    }

    transport.subscribe_queue(
      zoneId,
      100,
      (response: any, snakeCaseQueue: any) => {
        const queue = camelCaseKeys(snakeCaseQueue);
        const queueItems = extractQueueItems(queue);
        updateRoonTrackLengths(queueItems);

        /* eslint-disable no-console */
        console.log('server.js: subscribeToQueueChanges: response:', response);
        console.log('server.js: subscribeToQueueChanges: queue:', queue);
        console.log(
          'server.js: subscribeToQueueChanges: queueItems:',
          queueItems,
        );
        /* eslint-enable no-console */

        playingQueueItems[zoneId] = queueItems[0] || null;

        queueChangedMessages = updateQueueChangedMessages(
          { zoneId, queueItems },
          queueChangedMessages,
        );
        io.emit('queueChanged', { zoneId, queueItems });

        activeSubscriptions.add(zoneId);

        return null;
      },
    );
  });
};

const coreMessageHandler = (messageType: any, snakeCaseData: any) => {
  const message = camelCaseKeys(snakeCaseData) as Record<string, unknown>;

  switch (messageType) {
    case 'Subscribed':
      logSubscribed(JSON.stringify(message));

      break;
    case 'Changed':
      logChanged(JSON.stringify(message));

      Object.keys(message).forEach(async (subType) => {
        switch (subType) {
          case 'zonesSeekChanged': {
            const zoneSeekPositions: ZoneSeekPosition[] =
              transformToZoneSeekPositions(
                RawZonesSeekChangedMessageSchema.parse(message[subType]),
              );

            const frontendMessage =
              frontendZonesSeekChangedMessage(zoneSeekPositions);

            io.emit('zonesSeekChanged', frontendMessage);

            zonePlayingStates = await updatePlays({
              db,
              zonePlayingStates,
              zoneSeekPositions,
              playingQueueItems,
            });

            logChangedZonesSeekChanged(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesChanged': {
            const zones = transformAdditionsToZones(
              RawZonesChangedMessageSchema.parse(message[subType]),
            );
            const frontendMessage = frontendZonesChangedMessage(zones);

            staticZoneData = fp.union(staticZoneData, zones);

            subscribeToQueueChanges(zones.map((zone) => zone.zoneId));

            io.emit('zonesChanged', frontendMessage);

            logChangedZonesChanged(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesAdded': {
            const zones = transformChangesToZones(
              RawZonesAddedMessageSchema.parse(message[subType]),
            );
            const frontendMessage = frontendZonesChangedMessage(zones);

            staticZoneData = fp.union(staticZoneData, zones);

            subscribeToQueueChanges(zones.map((zone) => zone.zoneId));

            io.emit('zonesChanged', frontendMessage);

            logChangedZonesAdded(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesRemoved': {
            logChangedZonesRemoved(JSON.stringify(message[subType]));

            break;
          }

          default: {
            logChangedUnknown(subType, JSON.stringify(message[subType]));

            break;
          }
        }
      });
      break;

    default: {
      logUnknown(JSON.stringify(message));
    }
  }
};

let coreReadyPromise;
let resolveCoreReady: any;

coreReadyPromise = new Promise((resolve) => {
  resolveCoreReady = resolve;
});

const roon = new RoonApi({
  /* eslint-disable camelcase */
  extension_id: 'com.roon-remote-backend.test',
  display_name: 'Roon Web Remote Extension',
  display_version: '0.0.0',
  publisher: 'Michael Pfeifer',
  email: 'michael.k.pfeifer@googlemail.com',
  website: 'https://github.com/michaelkpfeifer',

  core_paired: async (core: any) => {
    transport = core.services.RoonApiTransport;
    transport.subscribe_zones(coreMessageHandler);
    browseInstance = new RoonApiBrowse(core);

    resolveCoreReady();
  },

  core_unpaired: async () => {
    coreReadyPromise = new Promise((resolve) => {
      resolveCoreReady = resolve;
    });
  },
  /* eslint-enable camelcase */
});

const serviceStatus = new RoonApiStatus(roon);

roon.init_services({
  /* eslint-disable camelcase */
  required_services: [RoonApiTransport, RoonApiBrowse],
  provided_services: [serviceStatus],
  /* eslint-enable camelcase */
});

serviceStatus.set_status('All is good', false);

roon.start_discovery();

await coreReadyPromise;

let resolveZonesReady: any;
const zonesReadyPromise = new Promise((resolve) => {
  resolveZonesReady = resolve;
});

transport.get_zones((error: any, body: any) => {
  staticZoneData = transformTransportGetZones(
    RawTransportGetZonesResponseSchema.parse(camelCaseKeys(body.zones)),
  );

  resolveZonesReady();
});

await zonesReadyPromise;

/* eslint-disable no-console */
console.log('server.js: main(): staticZoneData:', staticZoneData);
/* eslint-enable no-console */

zonePlayingStates = staticZoneData.map((zone) => {
  return {
    zoneId: zone.zoneId,
    previousQueueItemId: null,
    previousPlayedSegments: [],
    previousPlayId: null,
  };
});

/* eslint-disable no-console */
console.log('server.js: main(): zonePlayingStates:', zonePlayingStates);
/* eslint-enable no-console */

subscribeToQueueChanges(staticZoneData.map((zone) => zone.zoneId));

const roonApiRateLimiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 1,
});

const albumAggregatesWithRoonTracks = await initializeRoonData(
  db,
  browseInstance,
);

/* eslint-disable no-console */
console.log(
  'server.js: main(): albumAggregatesWithRoonTracks:',
  albumAggregatesWithRoonTracks,
);
/* eslint-enable no-console */

const albumAggregatesWithPersistedData =
  await getAlbumAggregatesWithPersistedData(db, albumAggregatesWithRoonTracks);

/* eslint-disable no-console */
console.log(
  'server.js: main(): albumAggregatesWithPersistedData:',
  albumAggregatesWithPersistedData,
);
/* eslint-enable no-console */

enrichAlbumAggregatesWithMusicBrainzData(
  db,
  io,
  albumAggregatesWithPersistedData,
);

io.on('connection', async (socket) => {
  /* eslint-disable no-console */
  console.log('server.js: io.on(): Connected: socket.id:', socket.id);
  /* eslint-enable no-console */

  let coreUrl;
  if (coreUrlConfigured) {
    coreUrl = coreUrlConfigured;
  } else {
    const { host: coreAddress, port: corePort } = transport.core.moo.transport;
    coreUrl = `http://${coreAddress}:${corePort}`;
  }

  /* eslint-disable no-console */
  // console.log(
  //   'server.js: io.on(): transport.core.moo.transport:',
  //   transport.core.moo.transport,
  // );
  /* eslint-enable no-console */

  /* eslint-disable no-console */
  console.log('server.js: io.on(): coreUrl:', coreUrl);
  /* eslint-enable no-console */

  socket.emit('coreUrl', coreUrl);
  socket.emit('albums', albumAggregatesWithPersistedData);

  const frontendRoonState = frontendZonesChangedMessage(staticZoneData);

  /* eslint-disable no-console */
  console.log(
    'server.js: io.on(): frontendRoonState',
    JSON.stringify(frontendRoonState, null, 4),
  );
  /* eslint-enable no-console */

  socket.emit('initialState', frontendRoonState);

  queueChangedMessages.forEach((message) => {
    socket.emit('queueChanged', message);
  });

  socket.on('trackAddNext', ({ albumKey, roonPosition, zoneId }) => {
    roonApiRateLimiter.schedule(async () => {
      await browser.trackAddNext({
        browseInstance,
        albumKey,
        roonPosition,
        zoneId,
      });
    });
  });

  socket.on('albumAddNext', ({ albumKey, zoneId }) =>
    roonApiRateLimiter.schedule(async () => {
      await browser.albumAddNext({
        browseInstance,
        albumKey,
        zoneId,
      });
    }),
  );

  socket.on('pause', ({ zoneId }) => {
    transport.control(zoneId, 'pause');
  });

  socket.on('play', ({ zoneId }) => {
    transport.control(zoneId, 'play');
  });

  socket.on('disconnect', () => {
    /* eslint-disable no-console */
    console.log('server.js: disconnected: socket.id', socket.id);
    /* eslint-enable no-console */
  });
});

export { roon, server };
