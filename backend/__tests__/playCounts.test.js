import { findMatch } from '../src/playCounts.js';

describe('findMatch', () => {
  const history = [
    {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
      mbTrackId: '12345',
    },
    {
      mbArtistNames: 'The Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize??',
      mbTrackId: '23456',
    },
  ];

  test('finds an exact match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
    };

    expect(findMatch(history, nowPlaying)).toEqual(history[0]);
  });

  test('finds a close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across Universe',
    };
    expect(findMatch(history, nowPlaying)).toEqual(history[0]);
  });

  test('finds another not so close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize?? (commentary)',
    };
    expect(findMatch(history, nowPlaying)).toEqual(history[1]);
  });

  test('returns null for a non-matching track', () => {
    const nowPlaying = {
      mbArtistNames: 'Queen',
      mbAlbumName: 'A Night at the Opera',
      mbTrackName: 'Bohemian Rhapsody',
    };
    expect(findMatch(history, nowPlaying)).toBeNull();
  });
});
