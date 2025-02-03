import Result from './result.js';
import { camelCaseKeys } from './utils.js';

const getAlbumWithTracks = async (knex, artistName, albumName) => {
  const albumWithTracks = await knex('albums')
    .where({ artist_name: artistName, album_name: albumName })
    .select('artist_name', 'album_name', 'mb_album_id', 'release_date')
    .first()
    .then(async (album) => {
      if (!album) {
        return Result.Err('getAlbumWithTracks: albumNotFound');
      }

      const tracks = await knex('tracks')
        .where({ mb_album_id: album.mb_album_id })
        .select('mb_track_id', 'number', 'name')
        .orderBy('position', 'asc');

      if (!tracks) {
        return Result.Err('getAlbumWithTracks: tracksNotFound');
      }

      return Result.Ok({
        album: camelCaseKeys(album),
        tracks: camelCaseKeys(tracks),
      });
    });

  return albumWithTracks;
};

const insertAlbumWithTracks = async ({
  knex,
  artistName,
  albumName,
  mbRelease,
}) =>
  knex.transaction(async (trx) => {
    await trx('albums').insert({
      mb_album_id: mbRelease.id,
      artist_name: artistName,
      album_name: albumName,
      release_date: mbRelease.date,
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

    for (const artist of mbRelease['artist-credit']) {
      await trx('artists').insert({
        mb_artist_id: artist.artist.id,
        name: artist.name,
        sort_name: artist.artist['sort-name'],
        type: artist.artist.type,
        disambiguation: artist.artist.disambiguation,
      });

      await trx('albums_artists').insert({
        mb_album_id: mbRelease.id,
        mb_artist_id: artist.artist.id,
      });
    }
  });

export { getAlbumWithTracks, insertAlbumWithTracks };
