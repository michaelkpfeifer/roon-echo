import { AlbumAggregate } from '@shared/internal/albumAggregate.js';

const buildEmptyAlbumAggregate = (): AlbumAggregate => ({
  stage: 'empty',
});

export { buildEmptyAlbumAggregate };
