import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './config';
import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem';
import type { Zone } from '../../../shared/internal/zone';

type AppContextType = {
  albumAggregates: AlbumAggregate[];
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  queues: Record<string, RoonQueueItem[]>;
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  setQueues: Dispatch<SetStateAction<Record<string, RoonQueueItem[]>>>;
  zones: Record<string, Zone>;
};

export type { AppContextType };
