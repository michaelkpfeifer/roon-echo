type Play = {
  id: string;
  trackId: string;
  albumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  roonTrackName: string;
  roonNumber: string;
  roonPosition: number;
  roonLength: number;
  playedAt: string;
  fractionPlayed: number;
  isPlayed: boolean;
};

export type { Play };
