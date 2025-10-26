import { buildAlbumWithCandidatesAndReleases } from '../__factories__/albumFactory.js';
import { buildMbArtists } from '../__factories__/mbArtistFactory.js';
import { buildMbTracks } from '../__factories__/mbTrackFactory.js';
import { buildRelease } from '../__factories__/releaseFactory.js';
import { buildRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import { buildRoonTracks } from '../__factories__/roonTrackFactory.js';
import {
  buildInitialAlbumStructure,
  buildNewAlbumFromAlbum,
} from '../src/albumData.js';

describe('buildInitialAlbumStructure', () => {
  test('builds the fundamental album structure', () => {
    const roonAlbumId = 'UUID album 12345';
    const status = 'roonAlbumLoaded';
    const roonAlbum = buildRoonAlbum();
    const roonTracks = buildRoonTracks(2);

    const album = buildInitialAlbumStructure({
      roonAlbumId,
      status,
      roonAlbum,
      roonTracks,
    });

    expect(album).toEqual({
      roonAlbumId,
      status,
      sortKeys: {
        artistNames: roonAlbum.artistName,
        releaseDate: null,
        albumName: roonAlbum.albumName,
      },
      roonAlbum,
      roonTracks,
      candidates: [],
      releases: [],
      mbAlbum: {},
      mbArtists: [],
      mbTracks: [],
    });
  });
});

describe('buildNewAlbumFromAlbum', () => {
  test('replaces a candidate by an album if there are no releases yet', () => {
    const album = buildAlbumWithCandidatesAndReleases({
      candidateCount: 2,
      releaseCount: 0,
    });
    const firstCandidateId = album.candidates[0].mbAlbumId;
    const release = {
      release: buildRelease({ mbAlbumId: firstCandidateId }),
      mbArtists: buildMbArtists({ count: 1 }),
      mbTracks: buildMbTracks({ count: 2 }),
    };
    const secondCandidateId = album.candidates[1].mbAlbumId;

    const newAlbum = buildNewAlbumFromAlbum({ album, release });

    expect(newAlbum.candidates.length).toBe(1);
    expect(newAlbum.candidates[0].mbAlbumId).toBe(secondCandidateId);
    expect(newAlbum.releases.length).toBe(1);
    expect(newAlbum.releases[0]).toEqual(release);
  });

  test('replaces a candidate by an album if there already are some releases', () => {
    const album = buildAlbumWithCandidatesAndReleases({
      candidateCount: 2,
      releaseCount: 2,
    });
    const firstCandidateId = album.candidates[0].mbAlbumId;
    const release = {
      release: buildRelease({ mbAlbumId: firstCandidateId }),
      mbArtists: buildMbArtists({ count: 1 }),
      mbTracks: buildMbTracks({ count: 2 }),
    };
    const secondCandidateId = album.candidates[1].mbAlbumId;

    const newAlbum = buildNewAlbumFromAlbum({ album, release });

    expect(newAlbum.candidates.length).toBe(1);
    expect(newAlbum.candidates[0].mbAlbumId).toBe(secondCandidateId);
    expect(newAlbum.releases.length).toBe(3);
    expect(newAlbum.releases[2]).toEqual(release);
  });

  test('throws error if release does not correspond to candidate', () => {
    const album = buildAlbumWithCandidatesAndReleases({
      candidateCount: 2,
      releaseCount: 0,
    });
    const firstCandidateId = album.candidates[0].mbAlbumId;
    const release = {
      release: buildRelease({ mbAlbumId: `${firstCandidateId}-non-existing` }),
      mbArtists: buildMbArtists({ count: 1 }),
      mbTracks: buildMbTracks({ count: 2 }),
    };

    expect(() => buildNewAlbumFromAlbum({ album, release })).toThrow(
      `Error: Release does not match candidate`,
    );
  });
});
