const buildStableAlbumData = async (socket, browseInstance) => {};

const isRoonAlbumUnprocessable = (unparsedRawRoonAlbum: unknown) => {
  if (
    !(
      typeof unparsedRawRoonAlbum === 'object' &&
      unparsedRawRoonAlbum !== null &&
      'title' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.title == 'string' &&
      'subtitle' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.subtitle == 'string'
    )
  ) {
    return true;
  }

  return (
    unparsedRawRoonAlbum.title === '' ||
    unparsedRawRoonAlbum.subtitle === 'Unknown Artist'
  );
};

export { buildStableAlbumData, isRoonAlbumUnprocessable };
