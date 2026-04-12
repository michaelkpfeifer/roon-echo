import type { Dispatch, SetStateAction } from 'react';

import type { AppState } from './appState';
import type { Config } from './config';
import type { RoonState } from './roonState';

type AppContextType = {
  appState: AppState;
  config: Config;
  coreUrl: string | null;
  roonState: RoonState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  setConfig: Dispatch<SetStateAction<Config>>;
  setRoonState: Dispatch<SetStateAction<RoonState>>;
};

export type { AppContextType };
