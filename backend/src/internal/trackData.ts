import type { MbTrack } from '../../../shared/internal/mbTrack.js';

type TrackData = {
  trackId: string;
  albumId: string;
  roonTrackName: string;
  roonNumber: string;
  roonPosition: number;
  roonLength: number | null;
  mbTrackId: string | null;
  mbTrackName: string | null;
  mbMediumPosition: number | null;
  mbNumber: string | null;
  mbPosition: number | null;
  mbLength: number | null;
  createdAt: string;
  updatedAt: string;
};

const toMbTrack = (row: TrackData): MbTrack => {
  if (
    row.mbTrackId === null ||
    row.mbTrackName === null ||
    row.mbMediumPosition == null ||
    row.mbNumber === null ||
    row.mbPosition === null
  ) {
    throw new Error('trackData.ts: toMbTrack(): requiredPropertiesMissing');
  }

  return {
    trackId: row.trackId,
    albumId: row.albumId,
    mbTrackId: row.mbTrackId,
    mbTrackName: row.mbTrackName,
    mbMediumPosition: row.mbMediumPosition,
    mbNumber: row.mbNumber,
    mbPosition: row.mbPosition,
    mbLength: row.mbLength,
  };
};

export type { TrackData };
export { toMbTrack };
