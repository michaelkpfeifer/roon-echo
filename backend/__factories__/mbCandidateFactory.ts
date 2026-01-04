import { MbCandidate } from '../../shared/internal/mbCandidate';
import { buildMbCandidateArtists } from './mbCandidateArtistFactory';
import { buildMbCandidateTracks } from './mbCandidateTrackFactory';

const buildMbCandidate = (overrides?: Partial<MbCandidate>): MbCandidate => ({
  mbAlbumId: '019b89e7-8473-7429-aaef-300cb0cb6864',
  roonAlbumId: '019b89e7-ef2e-7d51-88f4-59141810c6a6',
  score: 100,
  trackCount: 10,
  releaseDate: '1999-10-10',
  mbCandidateAlbumName: 'Default Album 1',
  mbCandidateArtists: buildMbCandidateArtists(2),
  mbCandidateTracks: buildMbCandidateTracks(4),
  ...overrides,
});

const buildNthMbCandidate = (number: number): MbCandidate => {
  return buildMbCandidate({
    mbCandidateAlbumName: `Album ${number}`,
    trackCount: 10 + number,
  });
};

const buildMbCandidates = (count: number): MbCandidate[] => {
  const number = Array.from({ length: count }, (_, i) => i + 1);
  return number.map((n) => buildNthMbCandidate(n));
};

export { buildMbCandidate, buildMbCandidates };
