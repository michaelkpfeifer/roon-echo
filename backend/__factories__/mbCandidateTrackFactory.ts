import type { MbCandidateTrack } from '../../shared/internal/mbCandidateTrack.js';

const buildMbCandidateTrack = (
  overrides?: Partial<MbCandidateTrack>,
): MbCandidateTrack => ({
  mbTrackId: '019b89e2-177c-7094-944c-d3b14fc0b16e',
  name: 'Default Track 1',
  number: '1',
  position: 1,
  length: 12300,
  ...overrides,
});

const buildNthMbCandidateTrack = (number: number): MbCandidateTrack => {
  return buildMbCandidateTrack({
    name: `Track ${number}`,
    number: `${number}`,
    position: number,
  });
};

const buildMbCandidateTracks = (count: number): MbCandidateTrack[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbCandidateTrack(n));
};

export { buildMbCandidateTrack, buildMbCandidateTracks };
