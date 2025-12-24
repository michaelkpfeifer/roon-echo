import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { MbCandidate } from '@shared/internal/mbCandidate';
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

const fetchMbCandidates = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<MbCandidate[]> => {
  const roonAlbumId = roonAlbum.roonAlbumId;

  const rows = await db<DatabaseSchema['mb_candidates']>('mb_candidates')
    .where({ roon_album_id: roonAlbumId })
    .orderBy('score', 'desc');

  return rows.map((row) => ({
    mbAlbumId: row.mb_album_id,
    roonAlbumId: row.roon_album_id,
    score: row.score,
    trackCount: row.track_count,
    releaseDate: row.release_date,
    mbCandidateAlbumName: row.mb_candidate_album_name,
    mbCandidateArtists: JSON.parse(row.mb_candidate_artists),
    mbCandidateTracks: JSON.parse(row.mb_candidate_tracks),
  }));
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

const upsertMbCandidate = async (
  db: Knex<DatabaseSchema>,
  mbCandidate: MbCandidate,
) => {
  await db<DatabaseSchema['mb_candidates']>('mb_candidates')
    .insert({
      mb_album_id: mbCandidate.mbAlbumId,
      roon_album_id: mbCandidate.roonAlbumId,
      score: mbCandidate.score,
      track_count: mbCandidate.trackCount,
      release_date: mbCandidate.releaseDate,
      mb_candidate_album_name: mbCandidate.mbCandidateAlbumName,
      mb_candidate_artists: JSON.stringify(mbCandidate.mbCandidateArtists),
      mb_candidate_tracks: JSON.stringify(mbCandidate.mbCandidateTracks),
    })
    .onConflict(['mb_album_id', 'roon_album_id'])
    .merge();
};

export {
  dbInit,
  fetchMbCandidates,
  fetchRoonAlbumId,
  fetchRoonTracks,
  insertPlayedTrackInHistory,
  insertRoonAlbum,
  insertRoonTracks,
  upsertMbCandidate,
};
