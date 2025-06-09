const buildRelease = (overrrides = {}) => ({
  mbAlbumId: 'UUID release 10001',
  score: 100,
  trackCount: 10,
  ...overrrides,
});

export { buildRelease };
