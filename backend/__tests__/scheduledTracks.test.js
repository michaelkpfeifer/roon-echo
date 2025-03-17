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
  setPlayingTracks,
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
    const playedSegments = [];

    const newScheduledTracks = appendToScheduledTracks({
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    });

    expect(newScheduledTracks).toEqual([
      {
        ...mbTrackData,
        mbLength: 235,
        scheduledAt,
        zoneId,
        queueItemId,
        playedSegments,
      },
    ]);
  });

  test('appends track data to an existing list of scheduled tracks', () => {
    const scheduledTracks = [stWeen01Wiim];
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
    const playedSegments = [];

    const newScheduledTracks = appendToScheduledTracks({
      scheduledTracks,
      mbTrackData,
      scheduledAt,
      zoneId,
    });

    expect(newScheduledTracks).toEqual([
      stWeen01Wiim,
      {
        ...mbTrackData,
        mbLength: 235,
        scheduledAt,
        zoneId,
        queueItemId,
        playedSegments,
      },
    ]);
  });
});

describe('fuzzySearchInScheduledTracks', () => {
  const scheduledTracks = [stWeen01Wiim, stHerbert01Mp2000];

  test('finds an exact match', () => {
    const nowPlaying = {
      mbArtistNames: 'Ween',
      mbAlbumName: '12 Golden Country Greats',
      mbTrackName: "I'm holding you",
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
    ).toEqual(scheduledTracks[0]);
  });

  test('finds a close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'Ween',
      mbAlbumName: '12 Golden Country Greats',
      mbTrackName: "I'm Holding You Tight",
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
    ).toEqual(scheduledTracks[0]);
  });

  test('finds another not so close fuzzy match', () => {
    const nowPlaying = {
      mbArtistNames: 'Ween',
      mbAlbumName: '12 Golden Chutney Greats',
      mbTrackName: 'I Am Still Holding You Tight',
    };
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';

    expect(
      fuzzySearchInScheduledTracks({ scheduledTracks, zoneId, nowPlaying }),
    ).toEqual(scheduledTracks[0]);
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
      mbArtistNames: 'Ween',
      mbAlbumName: '12 Golden Country Greats',
      mbTrackName: "I'm holding you",
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

describe('setPlayingTracks', () => {
  test('sets the playing track for the given zone to null if there are no queue items', () => {
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1019008,
        length: 132,
        imageKey: '36fc347f98b0adcc52218463dd36f972',
        nowPlaying: {
          roonArtistName: 'A Tribe Called Quest',
          roonAlbumName: 'The Low End Theory',
          roonTrackName: 'Skypager',
        },
      },
      '1601f4f798ff1773c83b77e489ea00000000': null,
    };

    const newPlayingTracks = setPlayingTracks({
      zoneId,
      queueItems,
      playingTracks,
    });

    expect(newPlayingTracks).toEqual({
      '1601f4f798ff1773c83b77e489eaff98f7f4': null,
      '1601f4f798ff1773c83b77e489ea00000000': null,
    });
  });

  test('replaces the current playing track for the given zone', () => {
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen04Wiim, qiWeen01Wiim];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1019008,
        length: 132,
        imageKey: '36fc347f98b0adcc52218463dd36f972',
        nowPlaying: {
          roonArtistName: 'A Tribe Called Quest',
          roonAlbumName: 'The Low End Theory',
          roonTrackName: 'Skypager',
        },
      },
      '1601f4f798ff1773c83b77e489ea00000000': null,
    };

    const newPlayingTracks = setPlayingTracks({
      zoneId,
      queueItems,
      playingTracks,
    });

    expect(newPlayingTracks).toEqual({
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 886042,
        length: 241,
        imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: "I'm Holding You",
        },
      },
      '1601f4f798ff1773c83b77e489ea00000000': null,
    });
  });
});
