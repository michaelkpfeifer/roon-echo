import {
  augmentAlbumByStoredMbData,
  buildInitialAlbumStructure,
} from '../src/albumData.js';

describe('augmentAlbumByStoredMbData', () => {
  test('builds the correct structure', () => {
    const album = {
      status: 'roonAlbumLoaded',
      sortKeys: {
        artists: 'Avalon Emerson',
        releaseDate: null,
        title: '& the Charm',
      },
      roonAlbum: {
        title: '& the Charm',
        artist: 'Avalon Emerson',
        itemKey: '123:44',
        imageKey: 'imgkey123456',
      },
      roonTracks: [],
      mbAlbum: {},
      mbTracks: [],
      mbArtists: [],
      mbCandidates: [],
    };

    const mbAlbum = {
      roonArtistName: 'Avalon Emerson',
      roonAlbumName: '& the Charm',
      mbAlbumId: '33a9b962-1029-42fa-ab1d-3daff68eee2e',
      mbReleaseDate: '2024-04-28',
    };

    const mbArtists = [
      {
        mbArtistId: 'f91ec397-c4be-4672-8faa-2d2983682b1c',
        name: 'Avalon Emerson',
        sortName: 'Emerson, Avalon',
      },
      {
        mbArtistId: 'f91kdfj7-c4be-4672-8faa-1234567890ab',
        name: 'Nonexisting TestArtist',
        sortName: 'TestArtist, Nonexisting',
      },
    ];

    const track1 = {
      mbTrackId: '87bdf6e3-63f6-4ea6-bc8a-018d29375543',
      name: 'Sandrail Silhouette',
      number: '1',
      position: 1,
      length: 269446,
    };
    const track2 = {
      mbTrackId: 'db8e930b-3f99-4640-a6a0-dfdd9df30951',
      name: 'Entombed in Ice',
      number: '2',
      position: 2,
      length: 192960,
    };
    const mbTracks = [track1, track2];

    const augmentedAlbum = augmentAlbumByStoredMbData(album, {
      mbAlbum,
      mbArtists,
      mbTracks,
    });

    expect(augmentedAlbum).toEqual({
      status: 'mbAlbumLoaded',
      sortKeys: {
        artists: 'Emerson, Avalon; TestArtist, Nonexisting',
        releaseDate: '2024-04-28',
        title: '& the Charm',
      },
      roonAlbum: album.roonAlbum,
      roonTracks: [],
      mbAlbum,
      mbTracks,
      mbArtists,
      mbCandidates: [],
    });
  });
});

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
          artists: 'Wilco',
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
          artists: 'The Smile',
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
