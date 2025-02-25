import http from 'http';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import RoonApi from 'node-roon-api';
import RoonApiBrowse from 'node-roon-api-browse';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import enrichList from './albumData.js';
import * as browser from './browser.js';
import {
  extractNowPlayingFromZonesChangedMessage,
  frontendZonesChangedMessage,
  frontendZonesSeekChangedMessage,
} from './messages.js';
import {
  appendToScheduledTracks,
  findMatchInScheduledTracks,
} from './playCounts.js';
import { camelCaseKeys } from './utils.js';

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

let scheduledTracks = [];
let playingTracks = [];

const coreMessageHandler = (cmd, snakeCaseData) => {
  const data = camelCaseKeys(snakeCaseData);

  switch (cmd) {
    case 'Subscribed':
      /* eslint-disable no-console */
      console.log(
        'server.js: coreMessageHandler(): Received "Subscribed" message.',
      );
      /* eslint-enable no-console */

      break;
    case 'Changed':
      Object.keys(data).forEach((attr) => {
        switch (attr) {
          case 'zonesSeekChanged': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: processing zonesSeekChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );
            /* eslint-enable no-console */

            const frontendMessage = frontendZonesSeekChangedMessage(data[attr]);

            /* eslint-disable no-console */
            // console.log(
            //   'server.js: emitting zonesSeekChanged message: frontendMessage:',
            //   JSON.stringify(frontendMessage, null, 4),
            // );
            /* eslint-enable no-console */

            io.emit('zonesSeekChanged', frontendMessage);

            break;
          }

          case 'zonesChanged': {
            /* eslint-disable no-console */
            // console.log(
            //   'server.js: processing zonesChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );
            /* eslint-enable no-console */

            const zonesChangedMessage = frontendZonesChangedMessage(data[attr]);

            /* eslint-disable no-console */
            // console.log(
            //   'server.js: emitting zonesChanged message: zonesChangedMessage):',
            //   JSON.stringify(zonesChangedMessage, null, 4),
            // );
            /* eslint-enable no-console */

            io.emit('zonesChanged', zonesChangedMessage);

            /* eslint-disable no-console */
            console.log(
              'server.js: io.on(): scheduledTracks:',
              scheduledTracks,
            );
            console.log('server.js: io.on(): playingTracks:', playingTracks);
            /* eslint-enable no-console */

            [scheduledTracks, playingTracks] =
              extractNowPlayingFromZonesChangedMessage(data[attr]).reduce(
                (
                  [currentScheduledTracks, currentPlayingTracks],
                  [zoneId, nowPlaying],
                ) =>
                  findMatchInScheduledTracks({
                    scheduledTracks: currentScheduledTracks,
                    playingTracks: currentPlayingTracks,
                    zoneId,
                    nowPlaying,
                  }),
                [scheduledTracks, playingTracks],
              );

            /* eslint-disable no-console */
            console.log(
              'server.js: io.on(): scheduledTracks:',
              scheduledTracks,
            );
            console.log('server.js: io.on(): playingTracks:', playingTracks);
            /* eslint-enable no-console */

            break;
          }

          default: {
            /* eslint-disable no-console */
            console.log(
              'server.js: unknown message: attr:',
              JSON.stringify(attr, null, 4),
            );
            /* eslint-enable no-console */
            /* eslint-disable no-console */
            console.log(
              'server.js: unknown message: data[attr]',
              JSON.stringify(data[attr], null, 4),
            );
            /* eslint-enable no-console */

            break;
          }
        }
      });
      break;

    default: {
      /* eslint-disable no-console */
      console.log(
        'server.js: unknown message: cmd:',
        JSON.stringify(cmd, null, 4),
      );
      /* eslint-enable no-console */
      /* eslint-disable no-console */
      console.log(
        'server.js: unknown message: data',
        JSON.stringify(data, null, 4),
      );
      /* eslint-enable no-console */
    }
  }
};

let transport;
let browseInstance;

const roon = new RoonApi({
  /* eslint-disable camelcase */
  extension_id: 'com.roon-remote-backend.test',
  display_name: 'Roon Web Remote Extension',
  display_version: '0.0.0',
  publisher: 'Michael Pfeifer',
  email: 'michael.k.pfeifer@googlemail.com',
  website: 'https://github.com/michaelkpfeifer',

  core_paired: (core) => {
    transport = core.services.RoonApiTransport;
    transport.subscribe_zones(coreMessageHandler);
    browseInstance = new RoonApiBrowse(core);
  },

  core_unpaired: (/* core */) => {},
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

io.on('connection', (socket) => {
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

  transport.get_zones((error, body) => {
    if (error) {
      /* eslint-disable no-console */
      console.log('server.js: io.on(): Error getting zone data: error:', error);
      /* eslint-enable no-console */

      return;
    }

    /* eslint-disable no-console */
    // console.log(
    //   'server.js: io.on(): camelCaseKeys(body.zones)',
    //   JSON.stringify(camelCaseKeys(body.zones)),
    // );
    /* eslint-enable no-console */

    const frontendRoonState = frontendZonesChangedMessage(
      camelCaseKeys(body.zones),
    );

    socket.emit('initialState', frontendRoonState);
  });

  socket.on('browse', async (dataRef) => {
    let browseOptions;
    if (dataRef === undefined) {
      browseOptions = { hierarchy: 'browse', pop_all: true, item_key: null };
    } else {
      browseOptions = { hierarchy: 'browse', item_key: dataRef.itemKey };
    }
    await browser.browseAsync(browseInstance, browseOptions);
    const browseData = await browser.loadAsync(browseInstance, {
      hierarchy: 'browse',
    });

    socket.emit('browseData', browseData);
  });

  socket.on('albums', async () => {
    /* eslint-disable no-console */
    console.log('server.js: processing albums message');
    /* eslint-enable no-console */

    const albumsLoadData = await browser.loadAlbums(browseInstance);
    const enrichedAlbums = await enrichList(
      browseInstance,
      albumsLoadData.items,
    );

    /* eslint-disable no-console */
    console.log('enrichedAlbums.length:', enrichedAlbums.length);
    /* eslint-enable no-console */

    socket.emit('allAlbums', enrichedAlbums);
  });

  socket.on('trackAddNext', ({ albumKey, position, zoneId, mbTrackData }) => {
    /* eslint-disable no-console */
    console.log('server.js: processing trackAddNext message');
    console.log('server.js: io.on(): mbTrackData:', mbTrackData);
    /* eslint-enable no-console */

    scheduledTracks = appendToScheduledTracks({
      scheduledTracks,
      mbTrackData,
      uuid: uuidv4(),
      scheduledAt: Date.now(),
      zoneId,
    });

    /* eslint-disable no-console */
    console.log('server.js: io.on(): scheduledTracks:', scheduledTracks);
    /* eslint-enable no-console */

    browser.loadAlbum(browseInstance, albumKey).then((albumItems) => {
      const trackKey = albumItems.items[position].item_key;
      browser.loadTrack(browseInstance, trackKey).then((trackActions) => {
        const trackAddNextItem = trackActions.items.find(
          (item) => item.title === 'Add Next',
        );

        browseInstance.browse({
          hierarchy: 'browse',
          item_key: trackAddNextItem.item_key,
          zone_or_output_id: zoneId,
        });
      });
    });
  });

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
