import { buildInitialAlbumStructure } from '../src/albumData.js';

describe('buildInitialAlbumStructure', () => {
  test('builds the initial album structure from a list Roon albums', () => {
    const roonAlbums = {
      items: [
        {
          title: 'A Ghost Is Born',
          subtitle: 'Wilco',
          item_key: '123:44',
          image_key: 'imgkey123456',
        },
        {
          title: 'A Light for Attracting Attention',
          subtitle: 'The Smile',
          item_key: '123:55',
          image_key: 'imgKey234567',
        },
      ],
    };

    expect(buildInitialAlbumStructure(roonAlbums)).toEqual([
      {
        status: 'roonAlbumLoaded',
        sortKeys: {
          artist: 'Wilco',
          releaseDate: null,
          title: 'A Ghost Is Born',
        },
        roonAlbum: {
          title: 'A Ghost Is Born',
          artist: 'Wilco',
          itemKey: '123:44',
          imageKey: 'imgkey123456',
        },
        roonTracks: [],
        mbAlbum: {},
        mbTracks: [],
        mbArtists: [],
        mbCandidates: [],
      },
      {
        status: 'roonAlbumLoaded',
        sortKeys: {
          artist: 'The Smile',
          releaseDate: null,
          title: 'A Light for Attracting Attention',
        },
        roonAlbum: {
          title: 'A Light for Attracting Attention',
          artist: 'The Smile',
          itemKey: '123:55',
          imageKey: 'imgKey234567',
        },
        roonTracks: [],
        mbAlbum: {},
        mbTracks: [],
        mbArtists: [],
        mbCandidates: [],
      },
    ]);
  });
});
