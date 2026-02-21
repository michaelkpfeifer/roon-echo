type Play = {
  id: string;
  roonTrackId: string;
  albumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  roonTrackName: string;
  number: string;
  position: number;
  playedAt: string;
  fractionPlayed: number;
  isPlayed: boolean;
};

export type { Play };
