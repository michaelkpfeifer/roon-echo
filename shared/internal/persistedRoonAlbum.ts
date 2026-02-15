type PersistedRoonAlbum = {
  roonAlbumId: string;
  albumName: string;
  artistName: string;
  candidatesFetchedAt: string | null;
  candidatesMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type { PersistedRoonAlbum };
