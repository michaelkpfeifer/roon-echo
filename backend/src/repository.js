import knexInit from 'knex';

import Result from './result.js';
import { camelCaseKeys, snakeCaseKeys } from './utils.js';
import knexConfig from '../knexfile.js';

const knex = knexInit(knexConfig.development);

const dbInit = async () => {
  await knex.raw('PRAGMA journal_mode = WAL;');

  // TODO. The following lines cleaning the database need to be
  // removed once we reach a state where we want to keep the data we
  // have already processed.

  // await knex('roon_tracks').del();
  // await knex('roon_albums').del();
  // await knex('tracks').del();
  // await knex('albums').del();
  // await knex('artists').del();
  // await knex('albums_artists').del();
  // await knex('history').del();
};

const getRoonAlbumWithTracks = async ({ roonAlbumName, roonArtistName }) => {
  const roonAlbumWithTracks = await knex('roon_albums')
    .where({
      album_name: roonAlbumName,
      artist_name: roonArtistName,
    })
    .select('id', 'status', 'album_name', 'artist_name')
    .first()
    .then(async (roonAlbum) => {
      if (!roonAlbum) {
        return Result.Err('getRoonAlbumWithTracks: albumNotFound');
      }

      const roonTracks = await knex('roon_tracks')
        .where({
          roon_album_id: roonAlbum.id,
        })
        .select('track_name', 'number', 'position')
        .orderBy('position', 'asc');

      if (!roonTracks) {
        return Result.Err('getRoonAlbumWithTracks: tracksNotFound');
      }

      return Result.Ok(camelCaseKeys({ roonAlbum, roonTracks }));
    });

  return roonAlbumWithTracks;
};

const insertRoonAlbumWithTracks = async ({ roonAlbum, roonTracks }) => {
  knex.transaction(async (trx) => {
    await trx('roon_albums').insert(snakeCaseKeys(roonAlbum)).returning('id');
    await trx('roon_tracks').insert(snakeCaseKeys(roonTracks));
  });
};

const getReleaseWithArtistsAndTracks = async (releaseId) => {
  const releaseWithArtistsAndTracks = await knex('mb_albums')
    .where({
      mb_album_id: releaseId,
    })
    .select('mb_album_id', 'mb_release_date', 'score', 'track_count')
    .first()
    .then(async (release) => {
      if (!release) {
        return Result.Err('getReleaseWithArtistsAndTracks: releaseNotFound');
      }

      const mbArtistIds = await knex('albums_artists')
        .where({ mb_album_id: release.mb_album_id })
        .pluck('mb_artist_id');

      const mbArtists = await knex('mb_artists')
        .whereIn('mb_artist_id', mbArtistIds)
        .select('mb_artist_id', 'name', 'sort_name');

      const mbTracks = await knex('tracks')
        .where({ mb_album_id: release.mb_album_id })
        .select('mb_track_id', 'name', 'number', 'position', 'length')
        .orderBy('position', 'asc');

      if (!mbTracks) {
        return Result.Err('getReleaseWithArtistsAndTracks: tracksNotFound');
      }

      return Result.Ok(camelCaseKeys({ release, mbArtists, mbTracks }));
    });

  return releaseWithArtistsAndTracks;
};

const insertReleaseWithArtistsAndTracks = async ({
  album,
  artists,
  tracks,
}) => {
  knex.transaction(async (trx) => {
    await trx('mb_albums').where({ mb_album_id: album.mbAlbumId }).update({
      type: album.type,
    });

    for (const artist of artists) {
      await trx('mb_artists')
        .insert({
          mb_artist_id: artist.artist.id,
          name: artist.name,
          sort_name: artist.artist['sort-name'],
          type: artist.artist.type,
          disambiguation: artist.artist.disambiguation,
        })
        .onConflict('mb_artist_id')
        .merge();

      await trx('albums_artists')
        .insert({
          mb_album_id: album.mbAlbumId,
          mb_artist_id: artist.artist.id,
        })
        .onConflict(['mb_album_id', 'mb_artist_id'])
        .ignore();
    }

    await trx('tracks').insert(
      tracks
        .flatMap((medium) => medium.tracks)
        .map((track) => ({
          mb_album_id: album.mbAlbumId,
          mb_track_id: track.id,
          name: track.title,
          number: track.number,
          position: track.position,
          length: track.length,
        })),
    );
  });
};

const demoteCandidateToNoMatch = async (candidateId, roonAlbumId) => {
  knex.transaction(async (trx) => {
    await trx('roon_albums')
      .where({ id: roonAlbumId })
      .update({ status: 'noAlbumMatchFound' });

    await trx('mb_albums')
      .where({ mb_album_id: candidateId })
      .update({ type: 'noMatch' });
  });
};

const promoteReleaseToMatch = async (releaseId, roonAlbumId) => {
  knex.transaction(async (trx) => {
    await trx('roon_albums')
      .where({ id: roonAlbumId })
      .update({ status: 'albumMatched' });

    await trx('mb_albums')
      .where({ mb_album_id: releaseId })
      .update({ type: 'match' });
  });
};

const getCandidates = async (album) => {
  const candidates = await knex('mb_albums')
    .where({
      roon_album_id: album.id,
      type: 'candidate',
    })
    .select('mb_album_id', 'score', 'candidate_priority', 'track_count')
    .orderBy('candidate_priority');

  if (candidates.length === 0) {
    return Result.Err('getCandidates: noCandidatesFound');
  }

  return Result.Ok(camelCaseKeys(candidates));
};

const insertCandidates = async (album, candidates) =>
  knex.transaction(async (trx) => {
    for (const [
      candidatePriority,
      candidate,
    ] of candidates.releases.entries()) {
      await trx('mb_albums')
        .insert({
          mb_album_id: candidate.id,
          roon_album_id: album.id,
          type: 'candidate',
          score: candidate.score,
          candidate_priority: candidatePriority,
          track_count: candidate['track-count'],
          mb_release_date: candidate.date,
        })
        .onConflict('mb_album_id')
        .merge();

      await trx('roon_albums')
        .where({ id: album.id })
        .update({ status: 'candidatesLoaded' });

      for (const artist of candidate['artist-credit']) {
        await trx('mb_artists')
          .insert({
            mb_artist_id: artist.artist.id,
            name: artist.name,
            sort_name: artist.artist['sort-name'],
            type: artist.artist.type,
            disambiguation: artist.artist.disambiguation,
          })
          .onConflict('mb_artist_id')
          .merge();

        await trx('albums_artists')
          .insert({
            mb_album_id: candidate.id,
            mb_artist_id: artist.artist.id,
          })
          .onConflict(['mb_album_id', 'mb_artist_id'])
          .ignore();
      }
    }
  });

const getReleasesByRoonAlbumId = async (roonAlbumId) => {
  const releases = await knex('mb_albums').where({
    roon_album_id: roonAlbumId,
  });
  const camelCaseReleases = camelCaseKeys(releases);

  if (releases.length === 0) {
    return [];
  }

  const mbAlbumIds = releases.map((release) => release.mb_album_id);

  const tracks = await knex('tracks').whereIn('mb_album_id', mbAlbumIds);
  const camelCaseTracks = camelCaseKeys(tracks);

  const artists = await knex('albums_artists')
    .join(
      'mb_artists',
      'albums_artists.mb_artist_id',
      'mb_artists.mb_artist_id',
    )
    .whereIn('albums_artists.mb_album_id', mbAlbumIds)
    .select(
      'albums_artists.mb_album_id',
      'mb_artists.mb_artist_id',
      'mb_artists.name',
      'mb_artists.sort_name',
      'mb_artists.type',
      'mb_artists.disambiguation',
    );
  const camelCaseArtists = camelCaseKeys(artists);

  for (const release of camelCaseReleases) {
    release.tracks = camelCaseTracks.filter(
      (t) => t.mbAlbumId === release.mbAlbumId,
    );
    release.artists = camelCaseArtists
      .filter((a) => a.mbAlbumId === release.mbAlbumId)
      .map(({ mbAlbumId, ...artist }) => artist);
  }

  return camelCaseReleases;
};

const insertPlayedTrackInHistory = async (track) => {
  knex.transaction(async (trx) => {
    await trx('history').insert(track);
  });
};

export {
  dbInit,
  demoteCandidateToNoMatch,
  getCandidates,
  getReleaseWithArtistsAndTracks,
  getReleasesByRoonAlbumId,
  getRoonAlbumWithTracks,
  insertCandidates,
  insertPlayedTrackInHistory,
  insertReleaseWithArtistsAndTracks,
  insertRoonAlbumWithTracks,
  promoteReleaseToMatch,
};
