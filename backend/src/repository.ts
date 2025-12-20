import knexInit from 'knex';
import Result from './result.js';
import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import knexConfig from '../knexfile.js';
import { snakeCaseKeys } from './utils.js';
import type { DatabaseSchema } from '../databaseSchema';
import type { Knex } from 'knex';

const knex = knexInit(knexConfig.development);

const dbInit = async (db: Knex<DatabaseSchema>) => {
  // await knex('roon_tracks').del();
  // await knex('mb_tracks').del();
  // await knex('mb_albums').del();
  // await knex('mb_artists').del();
  // await knex('mb_albums_mb_artists').del();
  // await knex('candidates').del();
  // await knex('history').del();

  await db('roon_albums').del();
};

const insertPlayedTrackInHistory = () => {};

const fetchRoonAlbumId = async (
  db: Knex<DatabaseSchema>,
  rawRoonAlbum: RawRoonAlbum,
) => {
  const roonAlbumIds = await db<DatabaseSchema['roon_albums']>('roon_albums')
    .where({
      album_name: rawRoonAlbum.title,
      artist_name: rawRoonAlbum.subtitle,
    })
    .pluck('roon_album_id');

  if (roonAlbumIds.length === 0) {
    return Result.Err({
      fetchRoonAlbumId: 'Error: roonAlbumNotFound',
      album_name: rawRoonAlbum.title,
      artist_name: rawRoonAlbum.subtitle,
    });
  }

  return Result.Ok(roonAlbumIds[0]);
};

const insertRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
) => {
  db.transaction(async (trx) => {
    await trx('roon_albums').insert({
      roon_album_id: roonAlbum.roonAlbumId,
      album_name: roonAlbum.albumName,
      artist_name: roonAlbum.artistName,
    });
  });
};

export {
  dbInit,
  fetchRoonAlbumId,
  insertPlayedTrackInHistory,
  insertRoonAlbum,
};
