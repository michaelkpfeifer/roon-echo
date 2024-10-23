import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { frontendState } from './roon_state.js';

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

// app.get('/api/', (req, res) => {
//   res.json({ message: 'Connected.' });
// });

io.on('connection', (socket) => {
  console.log('connection received');

  socket.emit('frontendState', frontendState());

  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    io.emit('broadcastMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export { io, server };
