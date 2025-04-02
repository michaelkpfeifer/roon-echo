import { buildInitialAlbumStruture } from '../src/albumData.js';

describe('buildInitialAlbumStruture', () => {
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

    expect(buildInitialAlbumStruture(roonAlbums)).toEqual([
      {
        status: 'roonAlbumLoaded',
        roonData: {
          albumTitle: 'A Ghost Is Born',
          albumArtist: 'Wilco',
          itemKey: '123:44',
          imageKey: 'imgkey123456',
        },
        sortKeys: {
          albumArtist: 'Wilco',
          releaseDate: null,
          albumTitle: 'A Ghost Is Born',
        },
      },
      {
        status: 'roonAlbumLoaded',
        roonData: {
          albumTitle: 'A Light for Attracting Attention',
          albumArtist: 'The Smile',
          itemKey: '123:55',
          imageKey: 'imgKey234567',
        },
        sortKeys: {
          albumArtist: 'The Smile',
          releaseDate: null,
          albumTitle: 'A Light for Attracting Attention',
        },
      },
    ]);
  });
});
