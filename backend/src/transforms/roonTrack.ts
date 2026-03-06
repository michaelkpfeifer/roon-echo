import type { RawRoonTrack } from '../../../shared/external/rawRoonTrack.js';
import type { RoonTrack } from '../../../shared/internal/roonTrack.js';

const transformToRoonTrack = (
  raw: RawRoonTrack,
  albumId: string,
  trackId: string,
  index: number,
): RoonTrack => {
  const [roonNumber, roonTrackName] = raw.title.split(/\s(.+)/);

  return {
    trackId,
    albumId,
    roonTrackName,
    roonNumber,
    roonPosition: index + 1,
    roonLength: 12345,
  };
};

export { transformToRoonTrack };
