import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';

const buildRoonAlbum = (overrides?: Partial<RoonAlbum>): RoonAlbum => ({
  roonAlbumId: '019b8914-76dc-7470-a65e-0b2b45d74489',
  albumName: 'Default Album',
  artistName: 'Default Artist',
  itemKey: '1357:4',
  imageKey: 'dc7f2533fb475c3d3e80fce4ef7b2294',
  candidatesMatchedAt: null,
  candidatesFetchedAt: null,
  ...overrides,
});

export { buildRoonAlbum };
