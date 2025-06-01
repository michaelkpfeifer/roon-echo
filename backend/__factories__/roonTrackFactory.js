const buildRoonTrack = (overrides = {}) => ({
  trackName: 'Track 1',
  number: '1.',
  position: 1,
  ...overrides,
});

const buildNthRoonTrack = (number) =>
  buildRoonTrack({
    trackName: `Track ${number}`,
    number: `${number}.`,
    position: number,
  });

const buildRoonTracks = (count) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthRoonTrack(n));
};

export { buildNthRoonTrack, buildRoonTrack, buildRoonTracks };
