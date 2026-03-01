import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils.js';

const linkAlbumAndMbArtist = async (
  db: Knex<DatabaseSchema>,
  {
    albumId,
    mbArtistId,
    position,
    joinphrase,
  }: {
    albumId: string;
    mbArtistId: string;
    position: number;
    joinphrase: string;
  },
) => {
  await db<DatabaseSchema['albums_mb_artists']>('albums_mb_artists').insert(
    snakeCaseKeys({ albumId, mbArtistId, position, joinphrase }),
  );
};

export { linkAlbumAndMbArtist };
