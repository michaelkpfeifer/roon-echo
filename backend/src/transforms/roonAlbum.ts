import type { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import type { RoonAlbum } from '@shared/internal/roonAlbum';

const transformToRoonAlbum = (
  raw: RawRoonAlbum,
  roonAlbumId: string,
): RoonAlbum => ({
  roonAlbumId,
  albumName: raw.title,
  artistName: raw.subtitle,
  imageKey: raw.imageKey,
  itemKey: raw.itemKey,
});

export { transformToRoonAlbum };
