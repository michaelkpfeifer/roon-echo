import { backendUrl } from '../config'
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/internal/socket';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  backendUrl,
);

export { socket };
