import type { Dispatch, SetStateAction } from 'react';

import type { AppState } from './appState';
import type { Config } from './config';
import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Zone } from '../../../shared/internal/zone';

type AppContextType = {
  albumAggregates: AlbumAggregate[];
  appState: AppState;
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  setAppState: Dispatch<SetStateAction<AppState>>;
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  zones: Record<string, Zone>;
};

export type { AppContextType };
