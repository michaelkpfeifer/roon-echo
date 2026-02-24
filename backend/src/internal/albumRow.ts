import type { MbAlbum } from '../../../shared/internal/mbAlbum.js';
import type { PersistedRoonAlbum } from '../../../shared/internal/persistedRoonAlbum.js';

type AlbumRow = {
  albumId: string;
  roonAlbumName: string;
  roonAlbumArtistName: string;
  mbCandidatesFetchedAt: string | null;
  mbCandidatesMatchedAt: string | null;
  mbAlbumId: string | null;
  mbAlbumName: string | null;
  mbScore: number | null;
  mbTrackCount: number | null;
  mbReleaseDate: string | undefined;
  createdAt: string;
  updatedAt: string;
};

const toMbAlbum = (row: AlbumRow): MbAlbum => {
  if (
    row.mbAlbumId === null ||
    row.mbAlbumName === null ||
    row.mbScore === null ||
    row.mbTrackCount === null
  ) {
    throw new Error('albumRow.ts: toMbAlbum(): requiredPropertiesMissing');
  }

  return {
    albumId: row.albumId,
    mbAlbumId: row.mbAlbumId,
    mbAlbumName: row.mbAlbumName,
    mbScore: row.mbScore,
    mbTrackCount: row.mbTrackCount,
    mbReleaseDate: row.mbReleaseDate,
  };
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
export { toMbAlbum, toPersistedRoonAlbum };
