import http from 'http';

import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

import { transport } from './roon_init.js';
import { buildFrontendRoonState, camelCaseKeys } from './utils.js';

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

io.on('connection', (socket) => {
  /* eslint-disable no-console */
  console.log('server.js: connected: socket.id:', socket.id);
  /* eslint-enable no-console */

  const { host: coreAddress, port: corePort } = transport.core.moo.transport;
  const coreUrl = `http://${coreAddress}:${corePort}`;

  /* eslint-disable no-console */
  console.log('server.js: connected: coreUrl:', coreUrl);
  /* eslint-enable no-console */

  socket.emit('coreUrl', coreUrl);

  transport.get_zones((error, body) => {
    if (error) {
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

export { io, server };
