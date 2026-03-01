import dotenv from 'dotenv';
import type { Knex } from 'knex';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';

import { camelCaseKeys, snakeCaseKeys } from './utils.js';
import type { RawRoonAlbum } from '../../shared/external/rawRoonAlbum.js';
import type { MbAlbum } from '../../shared/internal/mbAlbum.js';
import type { MbCandidate } from '../../shared/internal/mbCandidate.js';
import type { MbTrack } from '../../shared/internal/mbTrack.js';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum.js';
import type { Play } from '../../shared/internal/play.js';
import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack.js';
import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { toMbAlbum, toPersistedRoonAlbum } from './internal/albumRow.js';
import { toMbTrack } from './internal/trackRow.js';

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

  return ok(toPersistedRoonAlbum(camelCaseKeys(roonAlbums[0])));
};

const fetchMbAlbumByAlbumId = async (
  db: Knex<DatabaseSchema>,
  albumId: string,
): Promise<Result<MbAlbum, { error: string; albumId: string }>> => {
  const mbAlbums = await db<DatabaseSchema['albums']>('albums').where({
    album_id: albumId,
  });

  if (mbAlbums.length === 0) {
    return err({
      error: 'repository.ts: fetchMbAlbumByAlbumId(): Error: mbAlbumNotFound',
      albumId,
    });
  }

  return ok(toMbAlbum(camelCaseKeys(mbAlbums[0])));
};

const fetchMbArtistsByAlbumId = async (
  db: Knex<DatabaseSchema>,
  albumId: string,
) => {
  const mbArtistRows = await db<DatabaseSchema['mb_artists']>('mb_artists')
    .join(
      'albums_mb_artists',
      'mb_artists.mb_artist_id',
      'albums_mb_artists.mb_artist_id',
    )
    .where({
      'albums_mb_artists.album_id': albumId,
    })
    .select([
      'mb_artists.mb_artist_id',
      'mb_artists.name',
      'mb_artists.sort_name',
    ]);

  return camelCaseKeys(mbArtistRows);
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

  const roonTracks = await db<DatabaseSchema['tracks']>('tracks')
    .select(
      'track_id',
      'album_id',
      'roon_track_name',
      'roon_number',
      'roon_position',
    )
    .where({
      album_id: albumId,
    })
    .orderBy('roon_number', 'asc');

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

const fetchMbTracksByAlbumId = async (
  db: Knex<DatabaseSchema>,
  albumId: string,
): Promise<MbTrack[]> => {
  const trackRows = await db<DatabaseSchema['tracks']>('tracks').where({
    album_id: albumId,
  });

  return trackRows.map((trackRow) => toMbTrack(camelCaseKeys(trackRow)));
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
      await trx<DatabaseSchema['tracks']>('tracks').insert({
        track_id: roonTrack.trackId,
        album_id: roonTrack.albumId,
        roon_track_name: roonTrack.roonTrackName,
        roon_number: roonTrack.roonNumber,
        roon_position: roonTrack.roonPosition,
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
    const album = await trx('albums')
      .where({ album_id: mbCandidate.albumId })
      .first();

    if (!album) {
      return err({
        error: 'repository.ts: normalizeCandidate(): Error: albumNotFound',
        mbCandidate,
      });
    }

    await trx('albums').where({ album_id: mbCandidate.albumId }).update({
      mb_album_id: mbCandidate.mbAlbumId,
      mb_album_name: mbCandidate.mbCandidateAlbumName,
      mb_score: mbCandidate.score,
      mb_track_count: mbCandidate.trackCount,
      mb_release_date: mbCandidate.releaseDate,
      updated_at: trx.fn.now(),
    });

    const albumTrackCountQueryResult = await trx('tracks')
      .where({
        album_id: mbCandidate.albumId,
      })
      .count('album_id AS count');

    const albumTrackCount: number = parseInt(
      albumTrackCountQueryResult[0]['count'].toString(),
      10,
    );

    if (albumTrackCount !== mbCandidate.mbCandidateTracks.length) {
      return err({
        error:
          'repository.ts: normalizeCandidate(): Error: trackCountsNotEqual',
        mbCandidate,
      });
    }

    for (const mbCandidateTrack of mbCandidate.mbCandidateTracks) {
      await trx<DatabaseSchema['tracks']>('tracks')
        .where({
          album_id: mbCandidate.albumId,
          roon_position: mbCandidateTrack.position,
        })
        .update({
          mb_track_id: mbCandidateTrack.mbTrackId,
          mb_track_name: mbCandidateTrack.name,
          mb_number: mbCandidateTrack.number,
          mb_position: mbCandidateTrack.position,
          mb_length: mbCandidateTrack.length,
        });
    }

    for (const mbArtist of mbCandidate.mbCandidateArtists) {
      await trx<DatabaseSchema['albums_mb_artists']>('albums_mb_artists')
        .where({
          album_id: mbCandidate.albumId,
          mb_artist_id: mbArtist.mbArtistId,
        })
        .delete();
    }

    let artistPosition = 1;

    for (const mbArtist of mbCandidate.mbCandidateArtists) {
      await trx<DatabaseSchema['mb_artists']>('mb_artists')
        .insert({
          mb_artist_id: mbArtist.mbArtistId,
          name: mbArtist.name,
          sort_name: mbArtist.sortName,
          disambiguation: mbArtist.disambiguation,
        })
        .onConflict('mb_artist_id')
        .merge();

      await trx<DatabaseSchema['albums_mb_artists']>(
        'albums_mb_artists',
      ).insert({
        album_id: mbCandidate.albumId,
        mb_artist_id: mbArtist.mbArtistId,
        position: artistPosition,
        joinphrase: mbArtist.joinphrase || '',
      });

      artistPosition++;
    }

    return ok({});
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

  const mbTracks = await fetchMbTracksByAlbumId(db, albumId);
  const mbArtists = await fetchMbArtistsByAlbumId(db, albumId);

  return ok(
    camelCaseKeys({
      mbAlbum: albumRow,
      mbArtists,
      mbTracks,
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
  fetchMbAlbumByAlbumId,
  fetchMbArtistsByAlbumId,
  fetchMbCandidates,
  fetchMbTracksByAlbumId,
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
