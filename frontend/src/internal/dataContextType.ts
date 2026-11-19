import type { Dispatch, SetStateAction } from 'react';

import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Tag } from '../../../shared/internal/tag';

type DataContextType = {
  albumAggregates: AlbumAggregate[];
  albumTags: Record<string, string[]>;
  albumTagsLoaded: boolean;
  setTags: Dispatch<SetStateAction<Tag[]>>;
  tags: Tag[];
};

export type { DataContextType };
