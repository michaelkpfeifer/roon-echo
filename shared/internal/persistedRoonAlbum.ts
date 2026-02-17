type PersistedRoonAlbum = {
  roonAlbumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  mbCandidatesFetchedAt: string | null;
  mbCandidatesMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type { PersistedRoonAlbum };
