import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/internal/socket';
import { backendUrl } from '../config'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  backendUrl,
);

export { socket };
