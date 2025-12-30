import { AlbumAggregate } from '@shared/internal/albumAggregate.js';
import { MbAlbum } from '@shared/internal/mbAlbum';
import { MbCandidate } from '@shared/internal/mbCandidate';
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

const buildAlbumAggregateWithMbMatch = (
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
  mbCandidates: MbCandidate[],
  mbAlbum: MbAlbum,
): Extract<AlbumAggregate, { stage: 'withMbMatch' }> => ({
  ...albumAggregateWithRoonTracks,
  stage: 'withMbMatch',
  mbCandidates,
  mbAlbum,
});

const buildAlbumAggregateWithoutMbMatch = (
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
  mbCandidates: MbCandidate[],
): Extract<AlbumAggregate, { stage: 'withoutMbMatch' }> => ({
  ...albumAggregateWithRoonTracks,
  stage: 'withoutMbMatch',
  mbCandidates,
});

export {
  buildAlbumAggregateWithMbMatch,
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
  buildAlbumAggregateWithoutMbMatch,
  buildEmptyAlbumAggregate,
};
