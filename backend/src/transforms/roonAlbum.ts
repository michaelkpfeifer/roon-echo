import type { RawRoonAlbum } from '../../../shared/external/rawRoonAlbum.js';
import type { RoonAlbum } from '../../../shared/internal/roonAlbum.js';

const transformToRoonAlbum = (
  raw: RawRoonAlbum,
  persistedAttributes: {
    albumId: string;
    mbCandidatesFetchedAt: string | null;
    mbCandidatesMatchedAt: string | null;
  },
): RoonAlbum => ({
  albumId: persistedAttributes.albumId,
  roonAlbumName: raw.title,
  roonAlbumArtistName: raw.subtitle,
  imageKey: raw.imageKey,
  itemKey: raw.itemKey,
  mbCandidatesFetchedAt: persistedAttributes.mbCandidatesFetchedAt,
  mbCandidatesMatchedAt: persistedAttributes.mbCandidatesMatchedAt,
});

export { transformToRoonAlbum };
