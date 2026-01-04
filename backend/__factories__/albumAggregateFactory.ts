import type { RoonAlbum } from '../../shared/internal/roonAlbum';

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

    default: {
      throw new Error(`Error: Unknown stage in test data setup.`);
    }
  }
};

export { buildAlbumAggregate };
