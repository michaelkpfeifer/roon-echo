import { buildRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import { buildRoonTracks } from '../__factories__/roonTrackFactory.js';
import { buildInitialAlbumStructure } from '../src/albumData.js';

describe('buildInitialAlbumStructure', () => {
  test('builds the fundamental album structure', () => {
    const id = 'UUID 12345';
    const status = 'roonAlbumLoaded';
    const roonAlbum = buildRoonAlbum();
    const roonTracks = buildRoonTracks(2);

    const album = buildInitialAlbumStructure({
      id,
      status,
      roonAlbum,
      roonTracks,
    });

    expect(album).toEqual({
      id,
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
