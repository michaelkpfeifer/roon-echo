import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getSubscribedState } from './roon_state.js';
import { transport } from './roon_init.js';

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
  socket.emit('subscribedState', getSubscribedState());
  console.log('server.js: connected: socket.id', socket.id);

  socket.on('pause', ({ zoneId }) => {
    console.log('server.js: processing pause message: message:', zoneId);

    transport.control(zoneId, 'pause');
  });

  socket.on('play', ({ zoneId }) => {
    console.log('server.js: processing play message: message:', zoneId);

    transport.control(zoneId, 'play');
  });

  socket.on('disconnect', () => {
    console.log('server.js: disconnected: socket.id', socket.id);
  });
});

export { io, server };
