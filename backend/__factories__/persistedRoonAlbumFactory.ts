import type { Knex } from 'knex';

import { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum';
import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils';

const buildPersistedRoonAlbum = (
  overrides?: Partial<PersistedRoonAlbum>,
): PersistedRoonAlbum => ({
  roonAlbumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
  albumName: 'Default Album',
  artistName: 'Default Artist',
  candidatesFetchedAt: null,
  candidatesMatchedAt: null,
  createdAt: '2026-01-18 16:00',
  updatedAt: '2026-01-18 16:00',
  ...overrides,
});

const createPersistedRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<PersistedRoonAlbum>,
) => {
  const persistedRoonAlbum: PersistedRoonAlbum = {
    roonAlbumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
    albumName: 'Default Album',
    artistName: 'Default Artist',
    candidatesFetchedAt: null,
    candidatesMatchedAt: null,
    createdAt: '2026-01-21 15:00',
    updatedAt: '2026-01-21 15:00',
    ...overrides,
  };

  await db('roon_albums').insert(snakeCaseKeys(persistedRoonAlbum));
  return persistedRoonAlbum;
};

export { buildPersistedRoonAlbum, createPersistedRoonAlbum };
