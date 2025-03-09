import {
  qiBurial01Wiim,
  qiBurial02Wiim,
  qiWeen01Wiim,
  qiWeen02Wiim,
  qiWeen03Wiim,
  qiWeen04Wiim,
} from '../__fixtures__/roonQueueMessages.js';
import {
  stHerbert01Mp2000,
  stHerbert02Mp2000,
  stWeen01Wiim,
  stWeen02Wiim,
  stWeen03Wiim,
  stWeen04Wiim,
} from '../__fixtures__/scheduledTracks.js';
import {
  appendToScheduledTracks,
  fuzzySearchInScheduledTracks,
  setQueueItemIdsInScheduledTracks,
} from '../src/scheduledTracks.js';

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
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItemId = null;

    const newScheduledTracks = appendToScheduledTracks({
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    });

    expect(newScheduledTracks).toEqual([
      { ...mbTrackData, mbLength: 235, scheduledAt, zoneId, queueItemId },
    ]);
  });

  test('appends track data to an existing list of scheduled tracks', () => {
    const scheduledTrack = {
      mbTrackName: 'Across the Universe',
      mbAlbumName: 'Let It Be',
      mbArtistNames: 'The Beatles',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      mbLength: 300,
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      queueItemId: null,
    };
    const scheduledTracks = [scheduledTrack];
    const mbTrackData = {
      mbTrackName: 'Contenida',
      mbAlbumName: '¡Ay!',
      mbArtistNames: 'Lucrecia Dalt',
      mbTrackId: 'b6e4d347-67b6-4cc5-aea7-5a4c0db9747a',
      mbLength: 235000,
    };
    const scheduledAt = 1739915176129;
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItemId = null;

    const newScheduledTracks = appendToScheduledTracks({
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    });

    expect(newScheduledTracks).toEqual([
      scheduledTrack,
      { ...mbTrackData, mbLength: 235, scheduledAt, zoneId, queueItemId },
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
      scheduledAt: 1739915100000,
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
    },
    {
      mbArtistNames: 'The Flaming Lips',
      mbAlbumName: 'Yoshimi Battles the Pink Robots',
      mbTrackName: 'Do You Realize??',
      mbTrackId: '23456',
      mbLength: 235,
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
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
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
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
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
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
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
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
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
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
    ).toBeNull();
  });
});

describe('setQueueItemIdsInScheduledTracks', () => {
  test('works for a single scheduled track and a single corresponding queued track', () => {
    const scheduledTracks = [stWeen01Wiim];
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen01Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual({
      ...stWeen01Wiim,
      queueItemId: qiWeen01Wiim.queueItemId,
    });
  });

  test('works for two scheduled tracks and two corresponding queued tracks', () => {
    const scheduledTracks = [stWeen01Wiim, stWeen02Wiim];
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen01Wiim, qiWeen02Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual({
      ...stWeen01Wiim,
      queueItemId: qiWeen01Wiim.queueItemId,
    });
    expect(newScheduledTracks[1]).toEqual({
      ...stWeen02Wiim,
      queueItemId: qiWeen02Wiim.queueItemId,
    });
  });

  test('does not do anything if track ID does not match', () => {
    const scheduledTracks = [stWeen01Wiim, stWeen02Wiim];
    const zoneId = '1601fa3b3ee4f063ed8d5549632fd4e18fcf';
    const queueItems = [qiWeen01Wiim, qiWeen02Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual(stWeen01Wiim);
    expect(newScheduledTracks[1]).toEqual(stWeen02Wiim);
  });

  test('finds the right tracks when scheduled across different zones', () => {
    const scheduledTracks = [
      stWeen01Wiim,
      stHerbert01Mp2000,
      stWeen02Wiim,
      stHerbert02Mp2000,
    ];
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen01Wiim, qiWeen02Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual({
      ...stWeen01Wiim,
      queueItemId: qiWeen01Wiim.queueItemId,
    });
    expect(newScheduledTracks[1]).toEqual(stHerbert01Mp2000);
    expect(newScheduledTracks[2]).toEqual({
      ...stWeen02Wiim,
      queueItemId: qiWeen02Wiim.queueItemId,
    });
    expect(newScheduledTracks[3]).toEqual(stHerbert02Mp2000);
  });

  test('does not do anything if tracks are not scheduled by Roon Echo', () => {
    const scheduledTracks = [stWeen01Wiim, stWeen02Wiim];
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiBurial01Wiim, qiBurial02Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual(stWeen01Wiim);
    expect(newScheduledTracks[1]).toEqual(stWeen02Wiim);
  });

  test('does not touch scheduled tracks that have already been matched', () => {
    const matchedTrack01 = {
      ...stWeen01Wiim,
      queueItemId: qiWeen01Wiim.queueItemId,
    };
    const matchedTrack02 = {
      ...stWeen02Wiim,
      queueItemId: qiWeen02Wiim.queueItemId,
    };
    const scheduledTracks = [
      matchedTrack01,
      matchedTrack02,
      stWeen03Wiim,
      stWeen04Wiim,
    ];
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen03Wiim, qiWeen04Wiim];

    const newScheduledTracks = setQueueItemIdsInScheduledTracks({
      scheduledTracks,
      zoneId,
      queueItems,
    });

    expect(newScheduledTracks[0]).toEqual(matchedTrack01);
    expect(newScheduledTracks[1]).toEqual(matchedTrack02);
    expect(newScheduledTracks[2]).toEqual({
      ...stWeen03Wiim,
      queueItemId: qiWeen03Wiim.queueItemId,
    });
    expect(newScheduledTracks[3]).toEqual({
      ...stWeen04Wiim,
      queueItemId: qiWeen04Wiim.queueItemId,
    });
  });
});
