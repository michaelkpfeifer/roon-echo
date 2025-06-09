const buildMbArtist = (overrides = {}) => ({
  mbArtistId: 'UUID mbArtist 10001',
  name: 'Default Artist 1',
  sortName: 'Artist 1, Default',
  ...overrides,
});

const buildMbArtists = ({ count, offset = 0 }) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1 + offset);
  return numbers.map((n) =>
    buildMbArtist({
      mbArtistId: `UUID mbArtist ${10000 + n}`,
      name: `Default Artist ${n}`,
      sortName: `Artist ${n}, Default`,
    }),
  );
};

export { buildMbArtist, buildMbArtists };
