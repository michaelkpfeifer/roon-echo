const buildRoonAlbum = (overrides = {}) => ({
  albumName: 'Default Album',
  artistName: 'Default Artist',
  itemKey: '1357:4',
  imageKey: 'dc7f2533fb475c3d3e80fce4ef7b2294',
  ...overrides,
});

export { buildRoonAlbum };
