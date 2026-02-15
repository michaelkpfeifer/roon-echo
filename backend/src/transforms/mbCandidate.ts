import type { MbCandidate } from '../../../shared/internal/mbCandidate.js';
import type { MbCandidateArtist } from '../../../shared/internal/mbCandidateArtist.js';
import type { MbCandidateTrack } from '../../../shared/internal/mbCandidateTrack.js';

const transformToMbCandidate = (
  roonAlbumId: string,
  rawMbCandidate: any,
  rawMbFetchReleaseResponse: any,
): MbCandidate => {
  const mbCandidateArtists: MbCandidateArtist[] = rawMbFetchReleaseResponse[
    'artist-credit'
  ].map((credit: any) => ({
    mbArtistId: credit.artist.id,
    joinphrase: credit.joinphrase,
    name: credit.artist.name,
    sortName: credit.artist['sort-name'],
    disambiguation: credit.artist.disambiguation,
  }));

  const mbCandidateTracks: MbCandidateTrack[] =
    rawMbFetchReleaseResponse.media.flatMap((medium: any) =>
      medium.tracks.map((track: any) => ({
        mbTrackId: track.id,
        name: track.title,
        number: track.number,
        position: track.position,
        length: track.length || track.recording.length || null,
      })),
    );

  return {
    mbAlbumId: rawMbFetchReleaseResponse.id,
    roonAlbumId,
    releaseDate: rawMbFetchReleaseResponse.date || null,
    score: rawMbCandidate.score,
    trackCount: mbCandidateTracks.length,
    mbCandidateAlbumName: rawMbFetchReleaseResponse.title,
    mbCandidateArtists,
    mbCandidateTracks,
  };
};

export { transformToMbCandidate };
