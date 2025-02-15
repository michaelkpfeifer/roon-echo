import { findMatch } from '../src/playCounts.js';

describe('findMatch', () => {
  const history = [
    {
      artistNames: 'The Beatles',
      albumName: 'Let It Be',
      trackName: 'Across the Universe',
      mbTrackId: '12345',
    },
    {
      artistNames: 'The Flaming Lips',
      albumName: 'Yoshimi Battles the Pink Robots',
      trackName: 'Do You Realize??',
      mbTrackId: '23456',
    },
  ];

  test('finds an exact match', () => {
    const nowPlaying = {
      artistNames: 'The Beatles',
      albumName: 'Let It Be',
      trackName: 'Across the Universe',
    };

    expect(findMatch(history, nowPlaying)).toEqual(history[0]);
  });

  test('finds a close fuzzy match', () => {
    const nowPlaying = {
      artistNames: 'The Beatles',
      albumName: 'Let It Be',
      trackName: 'Across Universe',
    };
    expect(findMatch(history, nowPlaying)).toEqual(history[0]);
  });

  test('finds another not so close fuzzy match', () => {
    const nowPlaying = {
      artistNames: 'Flaming Lips',
      albumName: 'Yoshimi Battles the Pink Robots',
      trackName: 'Do You Realize?? (commentary)',
    };
    expect(findMatch(history, nowPlaying)).toEqual(history[1]);
  });

  test('returns null for a non-matching track', () => {
    const nowPlaying = {
      artistNames: 'Queen',
      albumName: 'A Night at the Opera',
      trackName: 'Bohemian Rhapsody',
    };
    expect(findMatch(history, nowPlaying)).toBeNull();
  });
});
