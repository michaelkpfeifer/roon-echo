import Result from './result.js';
import { camelCaseKeys } from './utils.js';

const getAlbumWithArtistsAndTracks = async (
  knex,
  roonArtistName,
  roonAlbumName,
) => {
  const albumWithArtistsAndTracks = await knex('albums')
    .where({
      roon_artist_name: roonArtistName,
      roon_album_name: roonAlbumName,
    })
    .select(
      'roon_artist_name',
      'roon_album_name',
      'mb_album_id',
      'mb_release_date',
    )
    .first()
    .then(async (mbAlbum) => {
      if (!mbAlbum) {
        return Result.Err('getAlbumWithArtistsAndTracks: albumNotFound');
      }

      const mbArtistIds = await knex('albums_artists')
        .where({
          mb_album_id: mbAlbum.mb_album_id,
        })
        .pluck('mb_artist_id');

      const mbArtists = await knex('artists')
        .whereIn('mb_artist_id', mbArtistIds)
        .select('mb_artist_id', 'name', 'sort_name');

      const mbTracks = await knex('tracks')
        .where({ mb_album_id: mbAlbum.mb_album_id })
        .select('mb_track_id', 'name', 'number', 'position', 'length')
        .orderBy('position', 'asc');

      if (!mbTracks) {
        return Result.Err('getAlbumWithArtistsAndTracks: tracksNotFound');
      }

      return Result.Ok(camelCaseKeys({ mbAlbum, mbArtists, mbTracks }));
    });

  return albumWithArtistsAndTracks;
};

const insertAlbumWithArtistsAndTracks = async ({
  knex,
  roonArtistName,
  roonAlbumName,
  mbRelease,
}) =>
  knex.transaction(async (trx) => {
    await trx('albums').insert({
      mb_album_id: mbRelease.id,
      roon_artist_name: roonArtistName,
      roon_album_name: roonAlbumName,
      mb_release_date: mbRelease.date,
    });

    const tracks = mbRelease.media
      .flatMap((medium) => medium.tracks)
      .map((track) => ({
        mb_album_id: mbRelease.id,
        mb_track_id: track.id,
        name: track.title,
        number: track.number,
        position: track.position,
        length: track.length,
      }));

    await trx('tracks').insert(tracks);

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const artist of mbRelease['artist-credit']) {
      await trx('artists')
        .insert({
          mb_artist_id: artist.artist.id,
          name: artist.name,
          sort_name: artist.artist['sort-name'],
          type: artist.artist.type,
          disambiguation: artist.artist.disambiguation,
        })
        .onConflict('mb_artist_id')
        .merge();

      await trx('albums_artists').insert({
        mb_album_id: mbRelease.id,
        mb_artist_id: artist.artist.id,
      });
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */
  });

export { getAlbumWithArtistsAndTracks, insertAlbumWithArtistsAndTracks };
