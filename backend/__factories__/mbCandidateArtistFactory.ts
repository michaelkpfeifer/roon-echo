import type { MbCandidateArtist } from '../../shared/internal/mbCandidateArtist.js';

const buildMbCandidateArtist = (
  overrides?: Partial<MbCandidateArtist>,
): MbCandidateArtist => ({
  joinphrase: '',
  mbArtistId: '019b89dc-23cf-7ab0-84dd-118e09cf84ed',
  name: 'Default Artist 1',
  sortName: 'Artist, Default 1',
  disambiguation: 'Default Disambiguation 1',
  ...overrides,
});

const buildNthMbCandidateArtist = (number: number): MbCandidateArtist => {
  return buildMbCandidateArtist({
    name: `Artist ${number}`,
  });
};

const buildMbCandidateArtists = (count: number): MbCandidateArtist[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbCandidateArtist(n));
};

export { buildMbCandidateArtist, buildMbCandidateArtists };
