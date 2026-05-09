import { buildRoonAlbum } from './roonAlbumFactory.js';
import { buildRoonTracks } from './roonTrackFactory.js';
import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate.js';

type AlbumAggregateStage = AlbumAggregate['stage'];

const buildAlbumAggregate = (
  stage: AlbumAggregateStage,
  roonAlbum: RoonAlbum,
  roonTracks: RoonTrack[],
): AlbumAggregate => {
  switch (stage) {
    case 'withRoonAlbum':
      return {
        stage: 'withRoonAlbum',
        id: '019e0446-fd2d-7188-a008-ce167e6835aa',
        roonAlbum,
        sortCriteria: {
          artistNames: roonAlbum.roonAlbumArtistName,
          mbReleaseDate: null,
          roonAlbumName: roonAlbum.roonAlbumName,
        },
      };

    case 'withRoonTracks':
      return {
        stage: 'withRoonTracks',
        id: '019e0446-fd2d-7188-a008-ce167e6835aa',
        roonAlbum,
        roonTracks,
        sortCriteria: {
          artistNames: roonAlbum.roonAlbumArtistName,
          mbReleaseDate: null,
          roonAlbumName: roonAlbum.roonAlbumName,
        },
      };

    default: {
      throw new Error(`Error: Unknown stage in test data setup.`);
    }
  }
};

export { buildAlbumAggregate };
