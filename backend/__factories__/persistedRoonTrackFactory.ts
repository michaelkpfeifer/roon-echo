import type { Knex } from 'knex';

import type { PersistedRoonTrack } from '../../shared/internal/persistedRoonTrack.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils.js';

const createPersistedRoonTrack = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<PersistedRoonTrack>,
): Promise<PersistedRoonTrack> => {
  const persistedRoonTrack: PersistedRoonTrack = {
    trackId: '019c8126-94d4-7605-91af-34c8aa64e097',
    albumId: '019c8127-9bc6-7036-96b8-1427577a3c10',
    roonTrackName: 'Default Track',
    roonNumber: '1',
    roonPosition: 1,
    createdAt: '2026-01-21 16:00',
    updatedAt: '2026-01-21 16:30',
    ...overrides,
  };

  await db('tracks').insert(snakeCaseKeys(persistedRoonTrack));
  return persistedRoonTrack;
};

export { createPersistedRoonTrack };
