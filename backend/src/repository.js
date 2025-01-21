import Result from './result.js';
import { camelCaseKeys } from './utils.js';

const getAlbumWithTracks = async (knex, artistName, albumName) => {
  const albumWithTracks = await knex('albums')
    .where({ artist_name: artistName, album_name: albumName })
    .select('id', 'artist_name', 'album_name', 'release_date')
    .first()
    .then(async (album) => {
      if (!album) {
        return Result.Err('getAlbumWithTracks: albumNotFound');
      }

      const tracks = await knex('tracks')
        .where({ album_id: album.id })
        .select('id', 'number', 'name')
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
    const [albumId] = await trx('albums').insert({
      mb_release_id: mbRelease.id,
      artist_name: artistName,
      album_name: albumName,
      release_date: mbRelease.date,
    });
    const tracks = mbRelease.media
      .flatMap((medium) => medium.tracks)
      .map((track) => ({
        album_id: albumId,
        mb_track_id: track.id,
        name: track.title,
        number: track.number,
        position: track.position,
        length: track.length,
      }));

    await trx('tracks').insert(tracks);
  });

export { getAlbumWithTracks, insertAlbumWithTracks };
