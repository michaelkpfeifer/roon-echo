import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/internal/socket';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  'http://192.168.2.102:4000',
);

export { socket };
