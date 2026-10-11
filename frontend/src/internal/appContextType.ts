import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './config';
import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Tag } from '../../../shared/internal/tag';

type AppContextType = {
  albumAggregates: AlbumAggregate[];
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  setTags: Dispatch<SetStateAction<Tag[]>>;
  tags: Tag[];
};

export type { AppContextType };
