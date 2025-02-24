import { v4 as uuidv4 } from 'uuid';

import {
  appendToScheduledTracks,
  findMatchInScheduledTracks,
  fuzzySearchInScheduledTracks,
} from '../src/playCounts.js';

describe('appendToScheduledTracks', () => {
  test('appends track data to an empty list of scheduled tracks', () => {
    const scheduledTracks = [];
    const mbTrackData = {
      mbTrackName: 'Contenida',
      mbAlbumName: '¡Ay!',
      mbArtistNames: 'Lucrecia Dalt',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      mbLength: 235000,
    };
    const uuid = uuidv4();
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    const newScheduledTracks = appendToScheduledTracks(
      scheduledTracks,
      mbTrackData,
      uuid,
      scheduledAt,
      zoneId,
    );

    expect(newScheduledTracks).toEqual([
      { ...mbTrackData, mbLength: 235, uuid, scheduledAt, zoneId },
    ]);
  });

  test('appends track data to an existing list of scheduled tracks', () => {
    const scheduledTrack = {
      mbTrackName: 'Across the Universe',
      mbAlbumName: 'Let It Be',
      mbArtistNames: 'The Beatles',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      mbLength: 300,
      uuid: 'f6bbfa30-3f63-450b-85ad-abe56a40727d',
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    };
    const scheduledTracks = [scheduledTrack];
    const mbTrackData = {
      mbTrackName: 'Contenida',
      mbAlbumName: '¡Ay!',
      mbArtistNames: 'Lucrecia Dalt',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      mbLength: 235000,
    };
    const uuid = 'd4a4f947-f203-4edb-b61b-26abbe3d2a1c';
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    const newScheduledTracks = appendToScheduledTracks(
      scheduledTracks,
      mbTrackData,
      uuid,
      scheduledAt,
      zoneId,
    );

    expect(newScheduledTracks).toEqual([
      scheduledTrack,
      { ...mbTrackData, mbLength: 235, uuid, scheduledAt, zoneId },
    ]);
  });
});

describe('fuzzySearchInScheduledTracks', () => {
  const scheduledTracks = [
    {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
      mbTrackId: '12345',
      mbLength: 300,
      uuid: 'f6bbfa30-3f63-450b-85ad-abe56a40727d',
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
    {
      mbArtistNames: 'The Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize??',
      mbTrackId: '23456',
      mbLength: 235,
      uuid: 'd4a4f947-f203-4edb-b61b-26abbe3d2a1c',
      scheduledAt: 1739915122222,
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

    expect(
      fuzzySearchInScheduledTracks(scheduledTracks, zoneId, nowPlaying),
    ).toEqual(scheduledTracks[0]);
  });

  test('finds a close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across Universe',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(
      fuzzySearchInScheduledTracks(scheduledTracks, zoneId, nowPlaying),
    ).toEqual(scheduledTracks[0]);
  });

  test('finds another not so close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize?? (commentary)',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    expect(
      fuzzySearchInScheduledTracks(scheduledTracks, zoneId, nowPlaying),
    ).toEqual(scheduledTracks[1]);
  });

  test('returns null for a non-matching track', () => {
    const nowPlaying = {
      mbArtistNames: 'Queen',
      mbAlbumName: 'A Night at the Opera',
      mbTrackName: 'Bohemian Rhapsody',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    expect(
      fuzzySearchInScheduledTracks(scheduledTracks, zoneId, nowPlaying),
    ).toBeNull();
  });

  test('returns null if the zone ID does not match', () => {
    const nowPlaying = {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
    };
    const zoneId = '1601f4f798ff1773c83b77e489ea00000000';

    expect(
      fuzzySearchInScheduledTracks(scheduledTracks, zoneId, nowPlaying),
    ).toBeNull();
  });
});

describe('findMatchInScheduledTracks', () => {
  const scheduledTracks = [
    {
      mbArtistNames: 'The Beatles',
      mbAlbumName: 'Let It Be',
      mbTrackName: 'Across the Universe',
      mbTrackId: '12345',
      mbLength: 300,
      uuid: 'f6bbfa30-3f63-450b-85ad-abe56a40727d',
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
    {
      mbArtistNames: 'The Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize??',
      mbTrackId: '23456',
      mbLength: 235,
      uuid: 'd4a4f947-f203-4edb-b61b-26abbe3d2a1c',
      scheduledAt: 1739915200000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
  ];
  const playingTracks = [];

  test('shuffles scheduled tracks and playing tracks', () => {
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const roonArtistNames = 'The Beatles';
    const roonAlbumName = 'Let It Be';
    const roonTrackName = 'Across the Universe';

    const [newScheduledTracks, newPlayingTracks] = findMatchInScheduledTracks(
      scheduledTracks,
      playingTracks,
      zoneId,
      { roonArtistNames, roonAlbumName, roonTrackName },
    );

    expect(newScheduledTracks).toEqual([
      {
        mbArtistNames: 'The Flaming Lips',
        mbAlbumName: 'Yoshimi Battles the Pink Robots',
        mbTrackName: 'Do You Realize??',
        mbTrackId: '23456',
        mbLength: 235,
        uuid: 'd4a4f947-f203-4edb-b61b-26abbe3d2a1c',
        scheduledAt: 1739915200000,
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      },
    ]);
    expect(newPlayingTracks).toEqual([
      {
        mbArtistNames: 'The Beatles',
        mbAlbumName: 'Let It Be',
        mbTrackName: 'Across the Universe',
        mbTrackId: '12345',
        mbLength: 300,
        uuid: 'f6bbfa30-3f63-450b-85ad-abe56a40727d',
        scheduledAt: 1739915100000,
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      },
    ]);
  });

  test('keeps scheduled and playing tracks unchanged if no match is found', () => {
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const roonArtistNames = 'Ween';
    const roonAlbumName = 'Choclate And Cheese';
    const roonTrackName = 'Buenas Tardes Amigos';

    const [newScheduledTracks, newPlayingTracks] = findMatchInScheduledTracks(
      scheduledTracks,
      playingTracks,
      zoneId,
      { roonArtistNames, roonAlbumName, roonTrackName },
    );

    expect(newScheduledTracks).toEqual(scheduledTracks);
    expect(newPlayingTracks).toEqual(playingTracks);
  });
});
