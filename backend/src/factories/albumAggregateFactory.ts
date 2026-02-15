import type { AlbumAggregate } from '../../../shared/internal/albumAggregate.js';
import type { MbAlbum } from '../../../shared/internal/mbAlbum.js';
import type { MbArtist } from '../../../shared/internal/mbArtist.js';
import type { MbCandidate } from '../../../shared/internal/mbCandidate.js';
import type { MbTrack } from '../../../shared/internal/mbTrack.js';
import type { RoonAlbum } from '../../../shared/internal/roonAlbum.js';
import type { RoonTrack } from '../../../shared/internal/roonTrack.js';

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
  mbAlbumData: { mbAlbum: MbAlbum; mbArtists: MbArtist[]; mbTracks: MbTrack[] },
): Extract<AlbumAggregate, { stage: 'withMbMatch' }> => ({
  ...albumAggregateWithRoonTracks,
  stage: 'withMbMatch',
  mbCandidates,
  mbAlbum: mbAlbumData.mbAlbum,
  mbArtists: mbAlbumData.mbArtists,
  mbTracks: mbAlbumData.mbTracks,
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
