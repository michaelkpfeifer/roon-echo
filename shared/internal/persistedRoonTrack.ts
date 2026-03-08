type PersistedRoonTrack = {
  trackId: string;
  albumId: string;
  roonTrackName: string;
  roonNumber: string;
  roonPosition: number;
  roonLength: number | null;
  createdAt: string;
  updatedAt: string;
};

export type { PersistedRoonTrack };
