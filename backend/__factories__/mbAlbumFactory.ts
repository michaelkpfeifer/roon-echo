import type { MbAlbum } from '../../shared/internal/mbAlbum.js';

const buildMbAlbum = (overrides?: Partial<MbAlbum>): MbAlbum => ({
  albumId: '019b8aeb-b25d-7844-a6ab-2231c51693f1',
  mbAlbumId: '019c907b-ed12-773c-85d6-7d28092ef6a4',
  mbAlbumName: 'Some Album Name',
  mbScore: 100,
  mbTrackCount: 10,
  mbReleaseDate: '2025-10-10',
  ...overrides,
});

export { buildMbAlbum };
