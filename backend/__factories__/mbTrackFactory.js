const buildMbTrack = (overrides = {}) => ({
  mbTrackId: 'UUID mbTrack 10001',
  name: 'Track 1',
  number: '1.',
  position: 1,
  length: 200100,
  ...overrides,
});

const buildNthMbTrack = (number, index) =>
  buildMbTrack({
    mbTrackId: `UUID mbTrack ${10000 + number}`,
    name: `Track ${number}`,
    number: `${index}.`,
    position: index,
    length: 20000 + number * 100,
  });

const buildMbTracks = ({ count, offset = 0 }) => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1 + offset);
  return numbers.map((number, index) => buildNthMbTrack(number, index + 1));
};

export { buildMbTrack, buildMbTracks, buildNthMbTrack };
