import Result from './result.js';

const getAlbumWithTracks = async (knex, artistName, albumName) => {
  const albumWithTracks = await knex('albums')
    .where({ artistName, albumName })
    .select('id', 'artistName', 'albumName')
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

      return Result.Ok({ album, tracks });
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
      artistName,
      albumName,
      mb_release_id: mbRelease.id,
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
