import http from 'http';

import cors from 'cors';
import express from 'express';
import RoonApi from 'node-roon-api';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';
import { Server } from 'socket.io';

import {
  buildFrontendRoonState,
  buildZonesSeekChangedMessage,
  camelCaseKeys,
} from './utils.js';

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
      for (const attr in data) {
        switch (attr) {
          case 'zonesSeekChanged': {
            // console.log(
            //   'server.js: processing zonesSeekChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            const zonesSeekChangedMessage = buildZonesSeekChangedMessage(
              data[attr],
            );

            // console.log(
            //   'server.js: emitting zonesSeekChanged message: zonesSeekChangedMessage:',
            //   JSON.stringify(zonesSeekChangedMessage, null, 4),
            // );

            io.emit('zonesSeekChanged', zonesSeekChangedMessage);
            break;
          }

          case 'zonesChanged': {
            // console.log(
            //   'server.js: processing zonesChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            const zonesChangedMessage = buildFrontendRoonState(data[attr]);

            // console.log(
            //   'server.js: emitting zonesChanged message: zonesChangedMessage):',
            //   JSON.stringify(zonesChangedMessage, null, 4),
            // );

            io.emit('zonesChanged', zonesChangedMessage);
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
      }
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
  },

  core_unpaired: (/* core */) => {},
  /* eslint-enable camelcase */
});

const serviceStatus = new RoonApiStatus(roon);

roon.init_services({
  /* eslint-disable camelcase */
  required_services: [RoonApiTransport],
  provided_services: [serviceStatus],
  /* eslint-enable camelcase */
});

serviceStatus.set_status('All is good', false);

io.on('connection', (socket) => {
  /* eslint-disable no-console */
  console.log('server.js: connected: socket.id:', socket.id);
  /* eslint-enable no-console */

  const { host: coreAddress, port: corePort } = transport.core.moo.transport;
  const coreUrl = `http://${coreAddress}:${corePort}`;

  /* eslint-disable no-console */
  console.log(
    'server.js: connected: transport.core.moo.transport:',
    transport.core.moo.transport,
  );
  /* eslint-enable no-console */
  /* eslint-disable no-console */
  console.log('server.js: connected: coreUrl:', coreUrl);
  /* eslint-enable no-console */

  socket.emit('coreUrl', coreUrl);

  transport.get_zones((error, body) => {
    if (error) {
      /* eslint-disable no-console */
      console.log('server.js: Error getting zone data:', error);
      return;
      /* eslint-enable no-console */
    }

    const frontendRoonState = buildFrontendRoonState(camelCaseKeys(body.zones));

    socket.emit('subscribedState', frontendRoonState);
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
