import type { Knex } from 'knex';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';

import { camelCaseKeys, snakeCaseKeys } from './utils.js';
import type { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';
import type { MbCandidate } from '../../shared/internal/mbCandidate';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum';
import type { Play } from '../../shared/internal/play';
import type { RoonAlbum } from '../../shared/internal/roonAlbum';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack';
import type { RoonTrack } from '../../shared/internal/roonTrack';
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

const fetchRoonAlbum = async (
  db: Knex<DatabaseSchema>,
  rawRoonAlbum: RawRoonAlbum,
): Promise<
  Result<
    PersistedRoonAlbum,
    {
      error: string;
      albumName: string;
      artistName: string;
    }
  >
> => {
  const roonAlbums = await db<DatabaseSchema['roon_albums']>(
    'roon_albums',
  ).where({
    album_name: rawRoonAlbum.title,
    artist_name: rawRoonAlbum.subtitle,
  });

  if (roonAlbums.length === 0) {
    return err({
      error: 'repository.ts: fetchRoonAlbum(): Error: roonAlbumNotFound',
      albumName: rawRoonAlbum.title,
      artistName: rawRoonAlbum.subtitle,
    });
  }

  return ok(camelCaseKeys(roonAlbums[0]));
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

  return camelCaseKeys(roonTracks);
};

const findRoonTrackByNameAndAlbumName = async (
  db: Knex<DatabaseSchema>,
  roonAlbumName: string,
  roonTrackName: string,
): Promise<RoonExtendedTrack[]> => {
  const rows = await db<DatabaseSchema['roon_albums']>('roon_albums')
    .join(
      'roon_tracks',
      'roon_albums.roon_album_id',
      'roon_tracks.roon_album_id',
    )
    .where({
      'roon_albums.album_name': roonAlbumName,
      'roon_tracks.track_name': roonTrackName,
    })
    .select([
      'roon_tracks.roon_track_id',
      'roon_albums.roon_album_id',
      'roon_tracks.track_name',
      'roon_tracks.number',
      'roon_tracks.position',
      'roon_albums.album_name',
      'roon_albums.artist_name',
    ]);

  return rows.map((row): RoonExtendedTrack => {
    return {
      roonTrackId: row.roon_track_id,
      roonAlbumId: row.roon_album_id,
      trackName: row.track_name,
      number: row.number,
      position: row.position,
      roonAlbumName: row.album_name,
      roonArtistName: row.artist_name,
    };
  });
};

const fetchMbCandidates = async (
  db: Knex<DatabaseSchema>,
  roonAlbumId: string,
): Promise<MbCandidate[]> => {
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
): Promise<void> => {
  await db<DatabaseSchema['roon_albums']>('roon_albums').insert({
    roon_album_id: roonAlbum.roonAlbumId,
    album_name: roonAlbum.albumName,
    artist_name: roonAlbum.artistName,
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
    await trx<DatabaseSchema['mb_albums']>('mb_albums')
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

    await trx<DatabaseSchema['mb_tracks']>('mb_tracks')
      .insert(tracksToInsert)
      .onConflict(['mb_track_id', 'roon_album_id'])
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

      await trx<DatabaseSchema['mb_albums_mb_artists']>('mb_albums_mb_artists')
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
    return err({
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

const insertPlayedTrackInHistory = async (
  db: Knex<DatabaseSchema>,
  track: any,
) => {
  await db<DatabaseSchema['history']>('history').insert(track);
};

export {
  dbInit,
  fetchMbAlbum,
  fetchMbCandidates,
  fetchRoonAlbum,
  fetchRoonTracks,
  findRoonTrackByNameAndAlbumName,
  insertPlayedTrackInHistory,
  insertRoonAlbum,
  insertRoonTracks,
  normalizeCandidate,
  updateCandidatesFetchedAtTimestamp,
  updateCandidatesMatchedAtTimestamp,
  upsertMbCandidate,
  upsertPlay,
};
