import http from 'http';
import { exit } from 'node:process';

import Bottleneck from 'bottleneck';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import RoonApi from 'node-roon-api';
import RoonApiBrowse from 'node-roon-api-browse';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';
import { Server } from 'socket.io';

import * as browser from './browser.js';
import {
  logChanged,
  logChangedUnknown,
  logChangedZones,
  logChangedZonesAdded,
  logChangedZonesRemoved,
  logChangedZonesSeek,
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
import { dbInit } from './repository.js';
import { initializeRoonData } from './roonData.js';
import { RawZonesSeekChangedMessageSchema } from './schemas/rawZonesSeekChangedMessage.js';
import { transformToZoneSeekPositions } from './transforms/zoneSeekPosition.js';
import { camelCaseKeys } from './utils.js';
import type { PlayingQueueItems } from '../../shared/internal/playingQueueItems.js';
import type { ZonePlayingState } from '../../shared/internal/zonePlayingState.js';
import type { ZoneSeekPosition } from '../../shared/internal/zoneSeekPosition.js';
import { db } from '../db.js';

dbInit(db);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
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
let browseInstance: any;

let staticZoneData = {};
let zonePlayingStates: ZonePlayingState[] = [];
const playingQueueItems: PlayingQueueItems = {};

const subscribeToQueueChanges = (zoneIds: string[]) => {
  /* eslint-disable no-console */
  console.log('server.js: subscribeToQueueChanges(): zoneIds:', zoneIds);
  /* eslint-enable no-console */

  zoneIds.forEach((zoneId: string) => {
    transport.subscribe_queue(
      zoneId,
      100,
      (response: any, snakeCaseQueue: any) => {
        const queue = camelCaseKeys(snakeCaseQueue);
        const queueItems = extractQueueItems(queue);

        /* eslint-disable no-console */
        console.log('server.js: subscribeToQueueChanges: response:', response);
        console.log('server.js: subscribeToQueueChanges: queue:', queue);
        console.log(
          'server.js: subscribeToQueueChanges: queueItems:',
          queueItems,
        );
        /* eslint-enable no-console */

        playingQueueItems[zoneId] = queueItems[0] || null;

        io.emit('queueChanged', { zoneId, queueItems });

        return null;
      },
    );
  });
};

const coreMessageHandler = (messageType: any, snakeCaseData: any) => {
  const message = camelCaseKeys(snakeCaseData);

  switch (messageType) {
    case 'Subscribed':
      /* eslint-disable no-console */
      // console.log(
      //   'server.js: coreMessageHandler(): Received "Subscribed" message: message:',
      //   JSON.stringify(message, null, 4),
      // );
      /* eslint-enable no-console */

      logSubscribed(message);

      break;
    case 'Changed':
      /* eslint-disable no-console */
      // console.log(
      //   'server.js: coreMessageHandler(): Received "Changed" message: message:',
      //   JSON.stringify(message, null, 4),
      // );
      /* eslint-enable no-console */

      logChanged(message);

      Object.keys(message).forEach(async (subType) => {
        switch (subType) {
          case 'zonesSeekChanged': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: coreMessageHandler(): Received "zonesSeekChanged" message: message:',
            //   JSON.stringify(message[subType], null, 4),
            // );
            /* eslint-enable no-console */

            const zoneSeekPositions: ZoneSeekPosition[] =
              transformToZoneSeekPositions(
                RawZonesSeekChangedMessageSchema.parse(message[subType]),
              );

            const frontendMessage =
              frontendZonesSeekChangedMessage(zoneSeekPositions);

            /* eslint-disable no-console */
            // console.log(
            //   'server.js: emitting zonesSeekChanged message: frontendMessage:',
            //   JSON.stringify(frontendMessage, null, 4),
            // );
            /* eslint-enable no-console */

            io.emit('zonesSeekChanged', frontendMessage);

            zonePlayingStates = await updatePlays({
              db,
              zonePlayingStates,
              zoneSeekPositions,
              playingQueueItems,
            });

            logChangedZonesSeek(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesChanged': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: coreMessageHandler(): Received "zonesChanged" message: message:',
            //   JSON.stringify(message[subType], null, 4),
            // );
            /* eslint-enable no-console */

            const frontendMessage = frontendZonesChangedMessage(
              message[subType],
            );

            /* eslint-disable no-console */
            // console.log(
            //   'server.js: emitting zonesChanged message: frontendMessage):',
            //   JSON.stringify(frontendMessage, null, 4),
            // );
            /* eslint-enable no-console */

            io.emit('zonesChanged', frontendMessage);

            logChangedZones(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesAdded': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: coreMessageHandler(): Received "zonesAdded" message: message:',
            //   JSON.stringify(message[subType], null, 4),
            // );
            /* eslint-enable no-console */

            subscribeToQueueChanges(
              message[subType].map((zone: any) => zone.zoneId),
            );

            logChangedZonesAdded(JSON.stringify(message[subType]));

            break;
          }

          case 'zonesRemoved': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: coreMessageHandler(): Received "zonesRemoved" message: message:',
            //   JSON.stringify(message[subType], null, 4),
            // );
            /* eslint-enable no-console */

            logChangedZonesRemoved(JSON.stringify(message[subType]));

            break;
          }

          default: {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: coreMessageHandler(): Received unknown "Changed" message: message:',
            //   JSON.stringify(message[subType], null, 4),
            // );
            /* eslint-enable no-console */

            logChangedUnknown(subType, JSON.stringify(message[subType]));

            break;
          }
        }
      });
      break;

    default: {
      /* eslint-disable no-console */
      // console.log(
      //   'server.js: coreMessageHandler(): Received unknown message: message:',
      //   JSON.stringify(message, null, 4),
      // );
      /* eslint-enable no-console */

      logUnknown(message);
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

let zonesReadyPromise;
let resolveZonesReady: any;

zonesReadyPromise = new Promise((resolve) => {
  resolveZonesReady = resolve;
});

transport.get_zones((error: any, body: any) => {
  staticZoneData = Object.fromEntries(
    camelCaseKeys(body.zones).map((zoneData: any) => {
      return [
        zoneData.zoneId,
        {
          zoneId: zoneData.zoneId,
          displayName: zoneData.displayName,
        },
      ];
    }),
  );

  resolveZonesReady();
});

await zonesReadyPromise;

/* eslint-disable no-console */
console.log('server.js: main(): staticZoneData:', staticZoneData);
/* eslint-enable no-console */

zonePlayingStates = Object.keys(staticZoneData).map((zoneId) => {
  return {
    zoneId,
    previousQueueItemId: null,
    previousPlayedSegments: [],
    previousPlayId: null,
  };
});

/* eslint-disable no-console */
console.log('server.js: main(): zonePlayingStates:', zonePlayingStates);
/* eslint-enable no-console */

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

  transport.get_zones((error: any, body: any) => {
    if (error) {
      process.stderr.write(
        `Error: Could not get zone data from Roon core: ${error}.`,
      );
      exit(3);
    }

    const zones = camelCaseKeys(body.zones);

    /* eslint-disable no-console */
    console.log('server.js: io.on(): zones', JSON.stringify(zones, null, 4));
    /* eslint-enable no-console */

    const frontendRoonState = frontendZonesChangedMessage(zones);

    /* eslint-disable no-console */
    console.log(
      'server.js: io.on(): frontendRoonState',
      JSON.stringify(frontendRoonState, null, 4),
    );
    /* eslint-enable no-console */

    socket.emit('initialState', frontendRoonState);

    subscribeToQueueChanges(zones.map((zone: any) => zone.zoneId));
  });

  socket.on('trackAddNext', ({ albumKey, position, zoneId, mbTrackData }) => {
    roonApiRateLimiter.schedule(async () => {
      /* eslint-disable no-console */
      console.log('server.js: processing trackAddNext message');
      console.log('server.js: io.on(): mbTrackData:', mbTrackData);
      /* eslint-enable no-console */

      await browser.loadAlbum(browseInstance, albumKey).then((albumItems) => {
        const trackKey = albumItems.items[position].item_key;
        browser.loadTrack(browseInstance, trackKey).then((trackActions) => {
          const trackAddNextItem = trackActions.items.find(
            (item: any) => item.title === 'Add Next',
          );

          browseInstance.browse({
            hierarchy: 'browse',
            item_key: trackAddNextItem.item_key,
            zone_or_output_id: zoneId,
          });
        });
      });
    });
  });

  socket.on(
    'albumAddNext',
    ({ roonAlbum, mbAlbum, mbArtists, mbTracks, zoneId }) =>
      roonApiRateLimiter.schedule(async () => {
        /* eslint-disable no-console */
        console.log('server.js: processing albumAddNext message');
        console.log('server.js: io.on(): roonAlbum:', roonAlbum);
        console.log('server.js: io.on(): mbAlbum:', mbAlbum);
        console.log('server.js: io.on(): mbTracks:', mbTracks);
        console.log('server.js: io.on(): mbArtists:', mbArtists);
        /* eslint-enable no-console */

        browser
          .loadAlbum(browseInstance, roonAlbum.itemKey)
          .then((albumItems) => {
            const playAlbumKey = albumItems.items[0].item_key;

            browser
              .loadTrack(browseInstance, playAlbumKey)
              .then(async (albumPlayActions) => {
                const addNextAction = albumPlayActions.items.find(
                  (item: any) => item.title == 'Add Next',
                );

                await browseInstance.browse({
                  hierarchy: 'browse',
                  item_key: addNextAction.item_key,
                  zone_or_output_id: zoneId,
                });
              });
          });
      }),
  );

  socket.on('pause', ({ zoneId }) => {
    /* eslint-disable no-console */
    console.log('server.js: processing pause message: message:', zoneId);
    /* eslint-enable no-console */

    transport.control(zoneId, 'pause');
  });

  socket.on('play', ({ zoneId }) => {
    /* eslint-disable no-console */
    console.log('server.js: processing play message: message:', zoneId);
    /* eslint-enable no-console */

    transport.control(zoneId, 'play');
  });

  socket.on('disconnect', () => {
    /* eslint-disable no-console */
    console.log('server.js: disconnected: socket.id', socket.id);
    /* eslint-enable no-console */
  });
});

export { roon, server };
