import { appendToScheduledTracks, findMatch } from '../src/playCounts.js';

describe('appendToScheduledTracks', () => {
  test('appends track data to an empty list of scheduled tracks', () => {
    const scheduledTracks = [];
    const mbTrackData = {
      mbTrackName: 'Contenida',
      mbAlbumName: '¡Ay!',
      mbArtistNames: 'Lucrecia Dalt',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
    };
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    const newScheduledTracks = appendToScheduledTracks(
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    );

    expect(newScheduledTracks).toEqual([
      { ...mbTrackData, scheduledAt, zoneId },
    ]);
  });

  test('appends track data to an existing list of scheduled tracks', () => {
    const scheduledTrack = {
      mbTrackName: 'Across the Universe',
      mbAlbumName: 'Let It Be',
      mbArtistNames: 'The Beatles',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    };
    const scheduledTracks = [scheduledTrack];
    const mbTrackData = {
      mbTrackName: 'Contenida',
      mbAlbumName: '¡Ay!',
      mbArtistNames: 'Lucrecia Dalt',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
    };
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    const newScheduledTracks = appendToScheduledTracks(
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    );

    expect(newScheduledTracks).toEqual([
      scheduledTrack,
      { ...mbTrackData, scheduledAt, zoneId },
    ]);
  });
});

describe('findMatch', () => {
  const scheduledTracks = [
    {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
      mbTrackId: '12345',
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
    {
      mbArtistNames: 'The Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize??',
      mbTrackId: '23456',
      scheduledAt: 1739915200000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
  ];

  test('finds an exact match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(findMatch(scheduledTracks, zoneId, nowPlaying)).toEqual(
      scheduledTracks[0],
    );
  });

  test('finds a close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across Universe',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(findMatch(scheduledTracks, zoneId, nowPlaying)).toEqual(
      scheduledTracks[0],
    );
  });

  test('finds another not so close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize?? (commentary)',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    expect(findMatch(scheduledTracks, zoneId, nowPlaying)).toEqual(
      scheduledTracks[1],
    );
  });

  test('returns null for a non-matching track', () => {
    const nowPlaying = {
      mbArtistNames: 'Queen',
      mbAlbumName: 'A Night at the Opera',
      mbTrackName: 'Bohemian Rhapsody',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    expect(findMatch(scheduledTracks, zoneId, nowPlaying)).toBeNull();
  });

  test('returns null if the zone ID does not match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
    };
    const zoneId = '1601f4f798ff1773c83b77e489ea00000000';

    expect(findMatch(scheduledTracks, zoneId, nowPlaying)).toBeNull();
  });
});
