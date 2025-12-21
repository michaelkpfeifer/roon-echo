import { AlbumAggregate } from '@shared/internal/albumAggregate.js';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import { RoonTrack } from '@shared/internal/roonTrack';

const buildEmptyAlbumAggregate = (): Extract<
  AlbumAggregate,
  { stage: 'empty' }
> => ({
  stage: 'empty',
});

const buildAlbumAggregateWithRoonAlbum = (
  emptyAlbumAggregate: Extract<AlbumAggregate, { stage: 'empty' }>,
  roonAlbum: RoonAlbum,
): Extract<AlbumAggregate, { stage: 'withRoonAlbum' }> => ({
  ...emptyAlbumAggregate,
  stage: 'withRoonAlbum',
  id: roonAlbum.roonAlbumId,
  roonAlbum: roonAlbum,
});

const buildAlbumAggregateWithRoonTracks = (
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
  roonTracks: RoonTrack[],
): Extract<AlbumAggregate, { stage: 'withRoonTracks' }> => ({
  ...albumAggregateWithRoonAlbum,
  stage: 'withRoonTracks',
  roonTracks: roonTracks,
});

export {
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
  buildEmptyAlbumAggregate,
};
