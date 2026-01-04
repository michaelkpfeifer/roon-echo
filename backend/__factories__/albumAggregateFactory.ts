import type { RoonAlbum } from '../../shared/internal/roonAlbum';
import { buildRoonAlbum } from './roonAlbumFactory';

const buildAlbumAggregate = (
  stage: string,
  overrides?: {
    roonAlbum?: Partial<RoonAlbum>;
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

    default: {
      throw new Error(`Error: Unknown stage in test data setup.`);
    }
  }
};

export { buildAlbumAggregate };
