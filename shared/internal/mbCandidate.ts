import { MbCandidateArtist } from './mbCandidateArtist.js';
import { MbCandidateTrack } from './mbCandidateTrack.js';

type MbCandidate = {
  mbAlbumId: string;
  roonAlbumId: string;
  type: string;
  score: number | null;
  priority: number | null;
  trackCount: number | null;
  releaseDate: string | null;
  mbCandidateAlbumName: string;
  mbCandidateArtists: MbCandidateArtist[];
  mbCandidateTracks: MbCandidateTrack[];
};

export { MbCandidate };
