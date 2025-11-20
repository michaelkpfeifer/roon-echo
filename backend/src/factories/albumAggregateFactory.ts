import { AlbumAggregate } from '@shared/internal/albumAggregate.js';

function buildEmptyAlbumAggregate(): AlbumAggregate {
  return {
    stage: 'empty',
  };
}

export { buildEmptyAlbumAggregate };
