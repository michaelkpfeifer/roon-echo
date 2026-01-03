import { AlbumAggregate } from '../../../shared/internal/albumAggregate.js';
import { MbAlbum } from '../../../shared/internal/mbAlbum';
import { MbArtist } from '../../../shared/internal/mbArtist';
import { MbCandidate } from '../../../shared/internal/mbCandidate';
import { MbTrack } from '../../../shared/internal/mbTrack';
import { RoonAlbum } from '../../../shared/internal/roonAlbum';
import { RoonTrack } from '../../../shared/internal/roonTrack';

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
