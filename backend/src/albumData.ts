const buildStableAlbumData = async (socket, browseInstance) => {};

const isRoonAlbumUnprocessable = (
  roonAlbumName: string,
  roonArtistName: string,
) => roonAlbumName === '' || roonArtistName === 'Unknown Artist';

export {
  isRoonAlbumUnprocessable,
};
