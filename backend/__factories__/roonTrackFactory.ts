import type { Knex } from 'knex';
import fp from 'lodash/fp.js';

import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { RoonTrackRow } from '../../shared/internal/roonTrackRow.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils.js';

const createRoonTrack = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<RoonTrack>,
): Promise<RoonTrack> => {
  const roonTrack = {
    trackId: '019b894a-8ba4-7637-bd24-7227397cac9e',
    albumId: '019b894b-0a5b-7a69-84bb-e7ac6de04307',
    roonTrackName: 'Default Track 1',
    roonNumber: '1',
    roonPosition: 1,
    roonLength: 12345,
    createdAt: '2026-01-21 15:00',
    updatedAt: '2026-01-21 15:00',
    ...overrides,
  };

  await db<DatabaseSchema['tracks']>('tracks').insert(
    snakeCaseKeys(roonTrack) as RoonTrackRow,
  );

  return fp.omit(['createdAt', 'updatedAt'], roonTrack);
};

export { createRoonTrack };
