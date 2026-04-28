import type { Dispatch, SetStateAction } from 'react';

import type { AppState } from './appState';
import type { Config } from './config';
import type { RoonState } from './roonState';
import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Zone } from '../../../shared/internal/zone';

type AppContextType = {
  albumAggregates: AlbumAggregate[];
  appState: AppState;
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  roonState: RoonState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  setConfig: Dispatch<SetStateAction<Config>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  setRoonState: Dispatch<SetStateAction<RoonState>>;
  zones: Record<string, Zone>;
};

export type { AppContextType };
