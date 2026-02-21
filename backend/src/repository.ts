import dotenv from 'dotenv';
import type { Knex } from 'knex';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';

import { camelCaseKeys, snakeCaseKeys } from './utils.js';
import type { RawRoonAlbum } from '../../shared/external/rawRoonAlbum.js';
import type { MbCandidate } from '../../shared/internal/mbCandidate.js';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum.js';
import type { Play } from '../../shared/internal/play.js';
import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack.js';
import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { DatabaseSchema } from '../databaseSchema.js';

dotenv.config();

const deleteDataAtStartup = process.env.DELETE_DATA_AT_STARTUP;

const dbInit = async (db: Knex<DatabaseSchema>) => {
  if (deleteDataAtStartup === 'true') {
    await db('plays').del();
    await db('albums_mb_artists').del();
    await db('mb_artists').del();
    await db('mb_candidates').del();
    await db('tracks').del();
    await db('albums').del();
  }
};

const fetchRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  rawRoonAlbum: RawRoonAlbum,
): Promise<
  Result<
    PersistedRoonAlbum,
    {
      error: string;
      roonAlbumName: string;
      roonAlbumArtistName: string;
    }
  >
> => {
  const roonAlbums = await db<DatabaseSchema['albums']>('albums').where({
    roon_album_name: rawRoonAlbum.title,
    roon_album_artist_name: rawRoonAlbum.subtitle,
  });

  if (roonAlbums.length === 0) {
    return err({
      error: 'repository.ts: fetchRoonAlbum(): Error: roonAlbumNotFound',
      roonAlbumName: rawRoonAlbum.title,
      roonAlbumArtistName: rawRoonAlbum.subtitle,
    });
  }

  return ok(camelCaseKeys(roonAlbums[0]));
};

const updateCandidatesFetchedAtTimestamp = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<void> => {
  await db<DatabaseSchema['albums']>('albums')
    .where({ album_id: roonAlbum.albumId })
    .update({
      mb_candidates_fetched_at: roonAlbum.mbCandidatesFetchedAt,
    });
};

const updateCandidatesMatchedAtTimestamp = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<void> => {
  await db<DatabaseSchema['albums']>('albums')
    .where({ album_id: roonAlbum.albumId })
    .update({
      mb_candidates_matched_at: roonAlbum.mbCandidatesMatchedAt,
    });
};

const fetchRoonTracks = async (
  db: Knex<DatabaseSchema>,
  roonAlbum: RoonAlbum,
): Promise<RoonTrack[]> => {
  const albumId = roonAlbum.albumId;
  const roonTracks = await db<DatabaseSchema['roon_tracks']>('roon_tracks')
    .select('roon_track_id', 'album_id', 'track_name', 'number', 'position')
    .where({
      album_id: albumId,
    });

  return camelCaseKeys(roonTracks);
};

const findRoonTrackByNameAndAlbumName = async (
  db: Knex<DatabaseSchema>,
  roonAlbumName: string,
  roonTrackName: string,
): Promise<RoonExtendedTrack[]> => {
  const rows = await db<DatabaseSchema['albums']>('albums')
    .join('roon_tracks', 'albums.album_id', 'roon_tracks.album_id')
    .where({
      'albums.roon_album_name': roonAlbumName,
      'roon_tracks.track_name': roonTrackName,
    })
    .select([
      'roon_tracks.roon_track_id',
      'albums.album_id',
      'roon_tracks.track_name',
      'roon_tracks.number',
      'roon_tracks.position',
      'albums.roon_album_name',
      'albums.roon_album_artist_name',
    ]);

  return rows.map((row): RoonExtendedTrack => {
    return {
      roonTrackId: row.roon_track_id,
      albumId: row.album_id,
      trackName: row.track_name,
      number: row.number,
      position: row.position,
      roonAlbumName: row.roon_album_name,
      roonAlbumArtistName: row.roon_album_artist_name,
    };
  });
};

const fetchMbCandidates = async (
  db: Knex<DatabaseSchema>,
  albumId: string,
): Promise<MbCandidate[]> => {
  const rows = await db<DatabaseSchema['mb_candidates']>('mb_candidates')
    .where({ album_id: albumId })
    .orderBy('score', 'desc');

  return rows.map((row) => ({
    mbAlbumId: row.mb_album_id,
    albumId: row.album_id,
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
): Promise<void> => {
  await db<DatabaseSchema['albums']>('albums').insert({
    album_id: roonAlbum.albumId,
    roon_album_name: roonAlbum.roonAlbumName,
    roon_album_artist_name: roonAlbum.roonAlbumArtistName,
  });
};

const insertRoonTracks = async (
  db: Knex<DatabaseSchema>,
  roonTracks: RoonTrack[],
) => {
  db.transaction(async (trx) => {
    for (const roonTrack of roonTracks) {
      await trx<DatabaseSchema['roon_tracks']>('roon_tracks').insert({
        roon_track_id: roonTrack.roonTrackId,
        album_id: roonTrack.albumId,
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
      album_id: mbCandidate.albumId,
      score: mbCandidate.score,
      track_count: mbCandidate.trackCount,
      release_date: mbCandidate.releaseDate,
      mb_candidate_album_name: mbCandidate.mbCandidateAlbumName,
      mb_candidate_artists: JSON.stringify(mbCandidate.mbCandidateArtists),
      mb_candidate_tracks: JSON.stringify(mbCandidate.mbCandidateTracks),
    })
    .onConflict(['album_id'])
    .merge();
};

const normalizeCandidate = async (
  db: Knex<DatabaseSchema>,
  mbCandidate: MbCandidate,
) => {
  return db.transaction(async (trx) => {
    await trx<DatabaseSchema['albums']>('albums')
      .insert({
        album_id: mbCandidate.albumId,
        mb_album_name: mbCandidate.mbCandidateAlbumName,
        mb_score: mbCandidate.score,
        mb_track_count: mbCandidate.trackCount,
        mb_release_date: mbCandidate.releaseDate,
      })
      .onConflict(['album_id'])
      .merge();

    const tracksToInsert = mbCandidate.mbCandidateTracks.map((track) => ({
      mb_track_id: track.mbTrackId,
      album_id: mbCandidate.albumId,
      name: track.name,
      number: track.number,
      position: track.position,
      length: track.length,
    }));

    await trx<DatabaseSchema['mb_tracks']>('mb_tracks')
      .insert(tracksToInsert)
      .onConflict(['mb_track_id', 'album_id'])
      .merge();

    let position = 1;

    for (const artist of mbCandidate.mbCandidateArtists) {
      await trx<DatabaseSchema['mb_artists']>('mb_artists')
        .insert({
          mb_artist_id: artist.mbArtistId,
          name: artist.name,
          sort_name: artist.sortName,
          disambiguation: artist.disambiguation,
        })
        .onConflict('mb_artist_id')
        .ignore();

      await trx<DatabaseSchema['albums_mb_artists']>('albums_mb_artists')
        .insert({
          album_id: mbCandidate.albumId,
          mb_artist_id: artist.mbArtistId,
          position,
          joinphrase: artist.joinphrase || '',
        })
        .onConflict(['album_id', 'mb_artist_id'])
        .merge();

      position++;
    }
  });
};

const fetchMbAlbum = async (db: Knex<DatabaseSchema>, albumId: string) => {
  const albumRow = await db<DatabaseSchema['albums']>('albums')
    .where({ album_id: albumId })
    .first();

  if (!albumRow) {
    return err({
      fetchMbAlbum: 'Error: mbAlbumNotFound',
      album_id: albumId,
    });
  }

  const tracks = await db<DatabaseSchema['mb_tracks']>('mb_tracks')
    .where({
      album_id: albumId,
    })
    .orderBy('position', 'asc');

  const artists = await db<DatabaseSchema['mb_artists']>('mb_artists')
    .join(
      'albums_mb_artists',
      'mb_artists.mb_artist_id',
      'albums_mb_artists.mb_artist_id',
    )
    .where({
      'albums_mb_artists.album_id': albumId,
    })
    .select(
      'mb_artists.*',
      'albums_mb_artists.position',
      'albums_mb_artists.joinphrase',
    )
    .orderBy('albums_mb_artists.position', 'asc');

  return ok(
    camelCaseKeys({
      mbAlbum: albumRow,
      mbArtists: artists,
      mbTracks: tracks,
    }),
  );
};

const upsertPlay = async (db: Knex<DatabaseSchema>, play: Play) => {
  await db<DatabaseSchema['plays']>('plays')
    .insert(snakeCaseKeys(play))
    .onConflict(['id'])
    .merge();
};

export {
  dbInit,
  fetchMbAlbum,
  fetchMbCandidates,
  fetchRoonAlbum,
  fetchRoonTracks,
  findRoonTrackByNameAndAlbumName,
  insertRoonAlbum,
  insertRoonTracks,
  normalizeCandidate,
  updateCandidatesFetchedAtTimestamp,
  updateCandidatesMatchedAtTimestamp,
  upsertMbCandidate,
  upsertPlay,
};
