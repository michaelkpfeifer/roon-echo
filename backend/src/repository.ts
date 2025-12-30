import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { MbCandidate } from '@shared/internal/mbCandidate';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import { RoonTrack } from '@shared/internal/roonTrack';
import type { Knex } from 'knex';

import Result from './result.js';
import { camelCaseKeys } from './utils.js';
import type { DatabaseSchema } from '../databaseSchema';

const dbInit = async (db: Knex<DatabaseSchema>) => {
  // await db('mb_albums_mb_artists').del();
  // await db('mb_artists').del();
  // await db('mb_tracks').del();
  // await db('mb_albums').del();
  // await db('mb_candidates').del();
  // await db('roon_tracks').del();
  // await db('roon_albums').del();
};

const insertPlayedTrackInHistory = () => {};

const fetchRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  rawRoonAlbum: RawRoonAlbum,
) => {
  const roonAlbums = await db<DatabaseSchema['roon_albums']>(
    'roon_albums',
  ).where({
    album_name: rawRoonAlbum.title,
    artist_name: rawRoonAlbum.subtitle,
  });

  if (roonAlbums.length === 0) {
    return Result.Err({
      fetchRoonAlbum: 'Error: roonAlbumNotFound',
      album_name: rawRoonAlbum.title,
      artist_name: rawRoonAlbum.subtitle,
    });
  }

  return Result.Ok(camelCaseKeys(roonAlbums[0]));
};

const updateCandidatesFetchedAtTimestamp = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<void> => {
  await db<DatabaseSchema['roon_albums']>('roon_albums')
    .where({ roon_album_id: roonAlbum.roonAlbumId })
    .update({
      candidates_fetched_at: roonAlbum.candidatesFetchedAt,
    });
};

const updateCandidatesMatchedAtTimestamp = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<void> => {
  await db<DatabaseSchema['roon_albums']>('roon_albums')
    .where({ roon_album_id: roonAlbum.roonAlbumId })
    .update({
      candidates_matched_at: roonAlbum.candidatesMatchedAt,
    });
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

const normalizeCandidate = async (
  db: Knex<DatabaseSchema>,
  mbCandidate: MbCandidate,
) => {
  return db.transaction(async (trx) => {
    await trx('mb_albums')
      .insert({
        mb_album_id: mbCandidate.mbAlbumId,
        roon_album_id: mbCandidate.roonAlbumId,
        album_name: mbCandidate.mbCandidateAlbumName,
        score: mbCandidate.score,
        track_count: mbCandidate.trackCount,
        release_date: mbCandidate.releaseDate,
      })
      .onConflict(['mb_album_id', 'roon_album_id'])
      .merge();

    const tracksToInsert = mbCandidate.mbCandidateTracks.map((track) => ({
      mb_track_id: track.mbTrackId,
      mb_album_id: mbCandidate.mbAlbumId,
      roon_album_id: mbCandidate.roonAlbumId,
      name: track.name,
      number: track.number,
      position: track.position,
      length: track.length,
    }));

    await trx('mb_tracks')
      .insert(tracksToInsert)
      .onConflict(['mb_track_id', 'roon_album_id'])
      .merge();

    let position = 1;

    for (const artist of mbCandidate.mbCandidateArtists) {
      await trx('mb_artists')
        .insert({
          mb_artist_id: artist.mbArtistId,
          name: artist.name,
          sort_name: artist.sortName,
          disambiguation: artist.disambiguation,
        })
        .onConflict('mb_artist_id')
        .ignore();

      await trx('mb_albums_mb_artists')
        .insert({
          mb_album_id: mbCandidate.mbAlbumId,
          roon_album_id: mbCandidate.roonAlbumId,
          mb_artist_id: artist.mbArtistId,
          position: position,
          joinphrase: artist.joinphrase || '',
        })
        .onConflict(['mb_album_id', 'roon_album_id', 'mb_artist_id'])
        .merge();

      position++;
    }
  });
};

const fetchMbAlbum = async (db: Knex<DatabaseSchema>, roonAlbumId: string) => {
  const albumRow = await db<DatabaseSchema['mb_albums']>('mb_albums')
    .where({ roon_album_id: roonAlbumId })
    .first();

  if (!albumRow) {
    return Result.Err({
      fetchMbAlbum: 'Error: mbAlbumNotFound',
      roon_album_id: roonAlbumId,
    });
  }

  const tracks = await db<DatabaseSchema['mb_tracks']>('mb_tracks')
    .where({
      mb_album_id: albumRow.mb_album_id,
      roon_album_id: roonAlbumId,
    })
    .orderBy('position', 'asc');

  const artists = await db<DatabaseSchema['mb_artists']>('mb_artists')
    .join(
      'mb_albums_mb_artists',
      'mb_artists.mb_artist_id',
      'mb_albums_mb_artists.mb_artist_id',
    )
    .where({
      'mb_albums_mb_artists.mb_album_id': albumRow.mb_album_id,
      'mb_albums_mb_artists.roon_album_id': roonAlbumId,
    })
    .select(
      'mb_artists.*',
      'mb_albums_mb_artists.position',
      'mb_albums_mb_artists.joinphrase',
    )
    .orderBy('mb_albums_mb_artists.position', 'asc');

  return Result.Ok(
    camelCaseKeys({
      ...albumRow,
      tracks,
      artists,
    }),
  );
};

export {
  dbInit,
  fetchMbAlbum,
  fetchMbCandidates,
  fetchRoonAlbum,
  fetchRoonTracks,
  insertPlayedTrackInHistory,
  insertRoonAlbum,
  insertRoonTracks,
  normalizeCandidate,
  updateCandidatesFetchedAtTimestamp,
  updateCandidatesMatchedAtTimestamp,
  upsertMbCandidate,
};
