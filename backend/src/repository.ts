import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import { RoonTrack } from '@shared/internal/roonTrack';
import type { Knex } from 'knex';

import Result from './result.js';
import { camelCaseKeys } from './utils.js';
import type { DatabaseSchema } from '../databaseSchema';

const dbInit = async (db: Knex<DatabaseSchema>) => {
  // await db('roon_tracks').del();
  // await db('roon_albums').del();
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

const fetchRoonTracks = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<RoonTrack[]> => {
  const roonAlbumId = roonAlbum.roonAlbumId;
  const roonTracks = await db<DatabaseSchema['roon_albums']>('roon_tracks')
    .select(
      'roon_track_id',
      'roon_album_id',
      'track_name',
      'number',
      'position',
    )
    .where({
      roon_album_id: roonAlbumId,
    });

  if (roonTracks.length === 0) {
    // @ts-expect-error
    return Result.Err({
      fetchRoonTracks: 'Error: noRoonTracksFound',
      roon_album_id: roonAlbumId,
    });
  }

  // @ts-expect-error
  return Result.Ok(camelCaseKeys(roonTracks));
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

const insertRoonTracks = async (
  db: Knex<DatabaseSchema>,
  roonTracks: RoonTrack[],
) => {
  db.transaction(async (trx) => {
    for (const roonTrack of roonTracks) {
      await trx('roon_tracks').insert({
        roon_track_id: roonTrack.roonTrackId,
        roon_album_id: roonTrack.roonAlbumId,
        track_name: roonTrack.trackName,
        number: roonTrack.number,
        position: roonTrack.position,
      });
    }
  });
};

export {
  dbInit,
  fetchRoonAlbumId,
  fetchRoonTracks,
  insertPlayedTrackInHistory,
  insertRoonAlbum,
  insertRoonTracks,
};
