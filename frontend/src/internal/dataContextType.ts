import type { Dispatch, SetStateAction } from 'react';

import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Tag } from '../../../shared/internal/tag';

type DataContextType = {
  albumAggregates: AlbumAggregate[];
  tags: Tag[];
  setTags: Dispatch<SetStateAction<Tag[]>>;
};

export type { DataContextType };
