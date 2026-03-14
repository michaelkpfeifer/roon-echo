import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { Socket } from 'socket.io-client';

import type { AppState } from './appState';
import type { Config } from './config';
import type { RoonState } from './roonState';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../../shared/internal/socket';

type AppContextType = {
  appState: AppState;
  config: Config;
  coreUrl: string | null;
  roonState: RoonState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  setConfig: Dispatch<SetStateAction<Config>>;
  setRoonState: Dispatch<SetStateAction<RoonState>>;
  socketRef: RefObject<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>;
};

export type { AppContextType };
