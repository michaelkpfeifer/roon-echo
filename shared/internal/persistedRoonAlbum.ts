type PersistedRoonAlbum = {
  albumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  mbCandidatesFetchedAt: string | null;
  mbCandidatesMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type { PersistedRoonAlbum };
