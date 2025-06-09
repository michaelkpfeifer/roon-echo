const buildCandidate = (overrides = {}) => ({
  mbAlbumId: 'UUID candidate 10001',
  score: 100,
  candidatePriority: 0,
  trackCount: 10,
  ...overrides,
});

const buildCandidates = ({ count, offset = 0 }) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1 + offset);
  return numbers.map((n) =>
    buildCandidate({
      mbAlbumId: `UUID candidate ${10000 + n}`,
      candidatePriority: n,
    }),
  );
};

export { buildCandidate, buildCandidates };
