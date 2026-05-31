import type { RoonAlbumId } from './internal/roonAlbumId.js';

let roonAlbumIdCache: RoonAlbumId[] = [];

const getRoonAlbumIdCache = () => {
  return roonAlbumIdCache;
};

const setRoonAlbumIdCache = (newRoonAlbumCache: RoonAlbumId[]) => {
  roonAlbumIdCache = newRoonAlbumCache;
};

const findIndexInRoonAlbumIdCache = (
  roonAlbumName: string,
  roonAlbumArtistName: string,
) => {
  return roonAlbumIdCache.findIndex(
    ([cachedRoonAlbumName, cachedRoonAlbumArtistName]) =>
      cachedRoonAlbumName === roonAlbumName &&
      cachedRoonAlbumArtistName === roonAlbumArtistName,
  );
};

export {
  findIndexInRoonAlbumIdCache,
  getRoonAlbumIdCache,
  setRoonAlbumIdCache,
};
