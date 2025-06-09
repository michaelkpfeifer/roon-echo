import { buildCandidates } from './candidateFactory.js';
import { buildMbArtists } from './mbArtistFactory.js';
import { buildMbTracks } from './mbTrackFactory.js';
import { buildRelease } from './releaseFactory.js';
import { buildRoonAlbum } from './roonAlbumFactory.js';
import { buildRoonTracks } from './roonTrackFactory.js';
import { buildInitialAlbumStructure } from '../src/albumData.js';

const buildAlbum = (overrides = {}) => {
  const id = 'UUID album 12345';
  const status = 'roonAlbumLoaded';
  const roonAlbum = buildRoonAlbum();
  const roonTracks = buildRoonTracks(2);

  const album = buildInitialAlbumStructure({
    id,
    status,
    roonAlbum,
    roonTracks,
  });

  return { ...album, ...overrides };
};

const buildAlbumWithCandidatesAndReleases = ({
  candidateCount,
  releaseCount,
}) => {
  const candidates = buildCandidates({ count: candidateCount });
  const releaseNumbers = Array.from({ length: releaseCount }, (_, i) => i + 1);
  const releases = releaseNumbers.map((releaseNumber) => ({
    release: buildRelease({
      mbAlbumId: `UUID release ${10000 + releaseNumber}`,
    }),
    mbArtists: buildMbArtists({ count: 1, offset: releaseNumber - 1 }),
    mbTracks: buildMbTracks({ count: 2, offset: (releaseNumber - 1) * 10 }),
  }));

  return { ...buildAlbum(), candidates, releases };
};

export { buildAlbum, buildAlbumWithCandidatesAndReleases };
