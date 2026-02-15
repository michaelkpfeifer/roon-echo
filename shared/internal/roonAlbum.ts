type RoonAlbum = {
  roonAlbumId: string;
  albumName: string;
  artistName: string;
  imageKey: string;
  itemKey: string;
  candidatesFetchedAt: string | null;
  candidatesMatchedAt: string | null;
};

export type { RoonAlbum };
