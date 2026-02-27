import type { MbTrack } from '../../../shared/internal/mbTrack.js';

type TrackRow = {
  trackId: string;
  albumId: string;
  roonTrackName: string;
  roonNumber: string;
  roonPosition: number;
  mbTrackId: string | null;
  mbTrackName: string | null;
  mbNumber: string | null;
  mbPosition: number | null;
  mbLength: number | undefined;
  createdAt: string;
  updatedAt: string;
};

const toMbTrack = (row: TrackRow): MbTrack => {
  if (
    row.mbTrackId === null ||
    row.mbTrackName === null ||
    row.mbNumber === null ||
    row.mbPosition === null
  ) {
    throw new Error('trackRow.ts: toMbTrack(): requiredPropertiesMissing');
  }

  return {
    trackId: row.trackId,
    albumId: row.albumId,
    mbTrackId: row.mbTrackId,
    mbTrackName: row.mbTrackName,
    mbNumber: row.mbNumber,
    mbPosition: row.mbPosition,
    mbLength: row.mbLength,
  };
};

export type { TrackRow };
export { toMbTrack };
