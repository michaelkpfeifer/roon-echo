import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import type { TrackRow } from '../src/internal/trackRow.js';
import { snakeCaseKeys } from '../src/utils.js';

const createTrackRow = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<TrackRow>,
): Promise<TrackRow> => {
  const trackRow: TrackRow = {
    albumId: '019c9c1a-fe8f-78c4-ae46-c30fddf2314f',
    trackId: '019c9c24-8c7b-71af-ae7b-027b2ea38f70',
    roonTrackName: 'Track 1',
    roonNumber: '1',
    roonPosition: 1,
    mbTrackId: '019c9c29-4974-7664-a6f8-8aac0c68ae63',
    mbTrackName: 'Track 1',
    mbNumber: '1',
    mbPosition: 1,
    mbLength: 100,
    createdAt: '2026-01-01 16:00',
    updatedAt: '2016-01-01 16:00',
    ...overrides,
  };

  await db<DatabaseSchema['tracks']>('tracks').insert(snakeCaseKeys(trackRow));

  return trackRow;
};

export { createTrackRow };
