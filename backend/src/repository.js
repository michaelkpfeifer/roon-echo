const insertAlbumWithTracks = async ({
  knex,
  artistName,
  albumName,
  mbRelease,
}) => {
  return await knex.transaction(async (trx) => {
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
};

export { insertAlbumWithTracks };
