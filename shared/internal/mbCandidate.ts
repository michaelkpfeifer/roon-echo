import { MbCandidateArtist } from './mbCandidateArtist.js';
import { MbCandidateTrack } from './mbCandidateTrack.js';

type MbCandidate = {
  mbAlbumId: string;
  roonAlbumId: string;
  score: number | null;
  trackCount: number | null;
  releaseDate: string | null;
  mbCandidateAlbumName: string;
  mbCandidateArtists: MbCandidateArtist[];
  mbCandidateTracks: MbCandidateTrack[];
};

export { MbCandidate };
