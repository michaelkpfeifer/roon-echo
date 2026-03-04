import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import type { AlbumRow } from '../src/internal/albumRow.js';
import { snakeCaseKeys } from '../src/utils.js';

const createAlbumRow = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<AlbumRow>,
): Promise<AlbumRow> => {
  const albumRow: AlbumRow = {
    albumId: '019c9157-deb2-7dbd-b259-e70d2601ac58',
    roonAlbumName: 'Some Album',
    roonAlbumArtistName: 'Some Artist',
    mbCandidatesFetchedAt: null,
    mbCandidatesMatchedAt: null,
    mbAlbumId: '019c9158-eeff-7cb4-8618-d915e4d51732',
    mbAlbumName: 'Some Album',
    mbScore: 100,
    mbTrackCount: 10,
    mbReleaseDate: '2025-02-01',
    createdAt: '2026-01-01 16:00',
    updatedAt: '2016-01-01 16:00',
    ...overrides,
  };

  await db<DatabaseSchema['albums']>('albums').insert(snakeCaseKeys(albumRow));

  return albumRow;
};

export { createAlbumRow };
