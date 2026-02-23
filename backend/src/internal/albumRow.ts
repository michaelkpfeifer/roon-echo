import type { PersistedRoonAlbum } from '../../../shared/internal/persistedRoonAlbum.js';

type AlbumRow = {
  albumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  mbCandidatesFetchedAt: string | null;
  mbCandidatesMatchedAt: string | null;
  mbAlbumName: string | null;
  mbScore: string | null;
  mbTrackCount: string | null;
  mbReleaseDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const toPersistedRoonAlbum = (row: AlbumRow): PersistedRoonAlbum => {
  return {
    albumId: row.albumId,
    roonAlbumName: row.roonAlbumName,
    roonAlbumArtistName: row.roonAlbumArtistName,
    mbCandidatesFetchedAt: row.mbCandidatesFetchedAt,
    mbCandidatesMatchedAt: row.mbCandidatesMatchedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

export type { AlbumRow };
export { toPersistedRoonAlbum };
