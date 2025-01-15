const getAlbumWithTracks = async (knex, artistName, albumName) => {
  const albumWithTracks = await knex('albums')
    .where({ artistName, albumName })
    .select('*')
    .first()
    .then(async (album) => {
      if (!album) {
        return null;
      }

      const tracks = await knex('tracks')
        .where({ album_id: album.id })
        .select('*')
        .orderBy('number', 'asc');

      return { ...album, tracks };
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
    const [albumId] = await trx('albums').insert({ artistName, albumName });
    const tracks = mbRelease.media
      .flatMap((medium) => medium.tracks)
      .map((track) => ({
        name: track.title,
        number: track.number,
        album_id: albumId,
      }));

    await trx('tracks').insert(tracks);
  });

export { getAlbumWithTracks, insertAlbumWithTracks };
