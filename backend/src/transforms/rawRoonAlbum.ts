import type { RoonAlbumId } from '../internal/roonAlbumId.js';
import type { RawRoonAlbum } from '../external/rawRoonAlbum.js';

const transformToRoonAlbumId = (rawRoonAlbum: RawRoonAlbum): RoonAlbumId => {
  return [rawRoonAlbum.title, rawRoonAlbum.subtitle];
};

export { transformToRoonAlbumId };
