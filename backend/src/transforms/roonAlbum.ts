import type { RawRoonAlbum } from '../../../shared/external/rawRoonAlbum.js';
import type { RawRoonTrack } from '../../../shared/external/rawRoonTrack.js';
import type { RoonAlbum } from '../../../shared/internal/roonAlbum.js';
import type { RoonTrack } from '../../../shared/internal/roonTrack.js';

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

const transformToRoonTrack = (
  raw: RawRoonTrack,
  albumId: string,
  roonTrackId: string,
  index: number,
): RoonTrack => {
  const [number, trackName] = raw.title.split(/\s(.+)/);

  return {
    roonTrackId,
    albumId,
    trackName,
    number,
    position: index + 1,
  };
};

export { transformToRoonAlbum, transformToRoonTrack };
