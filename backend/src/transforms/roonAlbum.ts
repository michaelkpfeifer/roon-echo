import type { RawRoonAlbum } from '../../../shared/external/rawRoonAlbum';
import type { RawRoonTrack } from '../../../shared/external/rawRoonTrack';
import type { RoonAlbum } from '../../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../../shared/internal/roonTrack';

const transformToRoonAlbum = (
  raw: RawRoonAlbum,
  persistedAttributes: {
    roonAlbumId: string;
    candidatesFetchedAt: string | null;
    candidatesMatchedAt: string | null;
  },
): RoonAlbum => ({
  roonAlbumId: persistedAttributes.roonAlbumId,
  albumName: raw.title,
  artistName: raw.subtitle,
  imageKey: raw.imageKey,
  itemKey: raw.itemKey,
  candidatesFetchedAt: persistedAttributes.candidatesFetchedAt,
  candidatesMatchedAt: persistedAttributes.candidatesMatchedAt,
});

const transformToRoonTrack = (
  raw: RawRoonTrack,
  roonAlbumId: string,
  roonTrackId: string,
  index: number,
): RoonTrack => {
  const [number, trackName] = raw.title.split(/\s(.+)/);

  return {
    roonTrackId,
    roonAlbumId,
    trackName,
    number,
    position: index + 1,
  };
};

export { transformToRoonAlbum, transformToRoonTrack };
