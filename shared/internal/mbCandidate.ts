import type { MbCandidateArtist } from './mbCandidateArtist.js';
import type { MbCandidateTrack } from './mbCandidateTrack.js';

type MbCandidate = {
  mbAlbumId: string;
  albumId: string;
  score: number | null;
  trackCount: number | null;
  releaseDate: string | null;
  mbCandidateAlbumName: string;
  mbCandidateArtists: MbCandidateArtist[];
  mbCandidateTracks: MbCandidateTrack[];
};

export type { MbCandidate };
