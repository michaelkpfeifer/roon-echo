import { buildRoonAlbum } from './roonAlbumFactory';
import { buildRoonTracks } from './roonTrackFactory';
import type { RoonAlbum } from '../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../shared/internal/roonTrack';

const buildAlbumAggregate = (
  stage: string,
  overrides?: {
    roonAlbum?: Partial<RoonAlbum>;
    roonTracks?: Partial<RoonTrack>[];
  },
) => {
  switch (stage) {
    case 'empty': {
      return { stage };
    }

    case 'withRoonAlbum': {
      const roonAlbum = overrides?.roonAlbum
        ? overrides.roonAlbum
        : buildRoonAlbum();

      return {
        stage: 'withRoonAlbum',
        roonAlbum: roonAlbum,
      };
    }

    case 'withRoonTracks': {
      const roonAlbum = overrides?.roonAlbum
        ? overrides.roonAlbum
        : buildRoonAlbum();
      const roonTracks = overrides?.roonTracks
        ? overrides.roonTracks
        : buildRoonTracks(2);

      return {
        stage: 'withRoonAlbum',
        roonAlbum: roonAlbum,
        roonTracks: roonTracks,
      };
    }

    default: {
      throw new Error(`Error: Unknown stage in test data setup.`);
    }
  }
};

export { buildAlbumAggregate };
