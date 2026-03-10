import type { MbTrack } from '../../shared/internal/mbTrack.js';

const buildMbTrack = (overrides?: Partial<MbTrack>): MbTrack => ({
  trackId: '019caa5f-97d8-7bbc-8f91-aa59538d2e64',
  albumId: '019b8aef-b559-79a3-81ec-80f126b85554',
  mbTrackId: '019b8aef-7b2a-7e4f-aca9-6cf9c98c6729',
  mbTrackName: 'Default Track 1',
  mbMediumPosition: 1,
  mbNumber: '1',
  mbPosition: 1,
  mbLength: 25500,
  ...overrides,
});

const buildNthMbTrack = (number: number) =>
  buildMbTrack({
    mbTrackName: `Track ${number}`,
    mbNumber: `${number}`,
    mbPosition: number,
  });

const buildMbTracks = (count: number): MbTrack[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbTrack(n));
};

export { buildMbTrack, buildMbTracks };
