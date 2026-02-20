import type { MbAlbum } from '../../shared/internal/mbAlbum.js';

const buildMbAlbum = (overrides?: Partial<MbAlbum>): MbAlbum => ({
  mbAlbumId: '019b8aeb-6f04-7502-9da2-a76b5409b837',
  albumId: '019b8aeb-b25d-7844-a6ab-2231c51693f1',
  score: 100,
  trackCount: 10,
  releaseDate: '2025-10-10',
  ...overrides,
});

export { buildMbAlbum };
