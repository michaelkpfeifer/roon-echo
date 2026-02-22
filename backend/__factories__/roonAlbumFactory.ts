import type { Knex } from 'knex';
import fp from 'lodash/fp.js';

import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils.js';

const buildRoonAlbum = (overrides?: Partial<RoonAlbum>): RoonAlbum => ({
  albumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
  roonAlbumName: 'Default Album',
  roonAlbumArtistName: 'Default Artist',
  itemKey: '1357:4',
  imageKey: 'dc7f2533fb475c3d3e80fce4ef7b2294',
  mbCandidatesMatchedAt: null,
  mbCandidatesFetchedAt: null,
  ...overrides,
});

const createRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<RoonAlbum>,
): Promise<RoonAlbum> => {
  const roonAlbum: RoonAlbum = {
    albumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
    roonAlbumName: 'Default Album',
    roonAlbumArtistName: 'Default Artist',
    itemKey: '1357:4',
    imageKey: 'dc7f2533fb475c3d3e80fce4ef7b2294',
    mbCandidatesMatchedAt: null,
    mbCandidatesFetchedAt: null,
    ...overrides,
  };

  await db('albums').insert(
    snakeCaseKeys(fp.omit(['itemKey', 'imageKey'], roonAlbum)),
  );
  return roonAlbum;
};

export { buildRoonAlbum, createRoonAlbum };
