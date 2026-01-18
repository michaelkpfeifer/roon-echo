import { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum';

const buildPersistedRoonAlbum = (
  overrides?: Partial<PersistedRoonAlbum>,
): PersistedRoonAlbum => ({
  roonAlbumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
  albumName: 'Default Album',
  artistName: 'Default Artist',
  candidatesFetchedAt: null,
  candidatesMatchedAt: null,
  createdAt: '2026-01-18 16:00',
  updatedAt: '2026-01-18 16:00',
  ...overrides,
});

export { buildPersistedRoonAlbum };
