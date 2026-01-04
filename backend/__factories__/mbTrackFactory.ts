import { MbTrack } from '../../shared/internal/mbTrack';

const buildMbTrack = (overrides?: Partial<MbTrack>): MbTrack => ({
  mbTrackId: '019b8aef-7b2a-7e4f-aca9-6cf9c98c6729',
  mbAlbumId: '019b8aef-b559-79a3-81ec-80f126b85554',
  roonAlbumId: '019b8aef-e38e-76be-a769-193ccac8c920',
  name: 'Default Track 1',
  number: '1',
  position: 1,
  length: 25500,
  ...overrides,
});

const buildNthMbTrack = (number: number) =>
  buildMbTrack({
    name: `Track ${number}`,
    number: `${number}`,
    position: number,
  });

const buildMbTracks = (count: number): MbTrack[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbTrack(n));
};

export { buildMbTrack, buildMbTracks };
