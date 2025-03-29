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
  applySeekPositionToPlayedSegments,
  fuzzySearchInScheduledTracks,
  mergePlayedSegments,
  setPlayingTracks,
  setQueueItemIdsInScheduledTracks,
  updatePlayedSegmentsInScheduledTracks,
} from '../src/scheduledTracks.js';
import { toIso8601 } from '../src/utils.js';

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
    const lastPlayed = null;

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
        lastPlayed,
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
    const lastPlayed = null;

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
        lastPlayed,
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

  test('does not change the currently playing track is another track is scheduled', () => {
    const zoneId = '1601f4f798ff1773c83b77e489eaff98f7f4';
    const queueItems = [qiWeen04Wiim, qiWeen01Wiim];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 886045,
        length: 163,
        imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: "I Don't Wanna Leave You on the Farm",
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
        queueItemId: 886045,
        length: 163,
        imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: "I Don't Wanna Leave You on the Farm",
        },
      },
      '1601f4f798ff1773c83b77e489ea00000000': null,
    });
  });

  test('replaces the currently playing track by the current head of the queue', () => {
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
        queueItemId: 886045,
        length: 163,
        imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: "I Don't Wanna Leave You on the Farm",
        },
      },
      '1601f4f798ff1773c83b77e489ea00000000': null,
    });
  });
});

describe('mergePlayedSegments', () => {
  test('leaves an empty list of segments untouched', () => {
    const segments = [];

    const newSegments = mergePlayedSegments(segments);

    expect(newSegments).toEqual([]);
  });

  test('leaves a list of a single played segment untouched', () => {
    const segments = [[10, 100]];

    const newSegments = mergePlayedSegments(segments);

    expect(newSegments).toEqual([[10, 100]]);
  });

  test('merges two adjacent segments', () => {
    const segments = [
      [1, 2],
      [2, 3],
    ];

    const newSegments = mergePlayedSegments(segments);

    expect(newSegments).toEqual([[1, 3]]);
  });

  test('merges two adjacent segments even if they are in the wrong order', () => {
    const segments = [
      [2, 3],
      [1, 2],
    ];

    const newSegments = mergePlayedSegments(segments);

    expect(newSegments).toEqual([[1, 3]]);
  });

  test('finds the interval to merge in a larger list of segments', () => {
    const segments = [
      [10, 20],
      [80, 90],
      [40, 50],
      [30, 40],
    ];

    const newSegments = mergePlayedSegments(segments);

    expect(newSegments).toEqual([
      [10, 20],
      [30, 50],
      [80, 90],
    ]);
  });
});

describe('applySeekPositionToPlayedSegments', () => {
  test('inserts first segment into an empty list of segments', () => {
    const seekPosition = 0;
    const playedSegments = [];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([[0, 0]]);
  });

  test('inserts first segment into an empty list of segments if track does not play from the beginning', () => {
    const seekPosition = 30;
    const playedSegments = [];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([[30, 30]]);
  });

  test('appends to an existing segment', () => {
    const seekPosition = 30;
    const playedSegments = [
      [20, 29],
      [40, 50],
    ];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([
      [20, 30],
      [40, 50],
    ]);
  });

  test('finds the right segment to append to in a larger list of segments', () => {
    const seekPosition = 30;
    const playedSegments = [
      [40, 50],
      [20, 29],
      [80, 90],
      [60, 70],
    ];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([
      [20, 30],
      [40, 50],
      [60, 70],
      [80, 90],
    ]);
  });

  test('does not change segments if seekPosition is included in played segments', () => {
    const seekPosition = 30;
    const playedSegments = [
      [20, 30],
      [80, 90],
      [60, 70],
    ];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([
      [20, 30],
      [80, 90],
      [60, 70],
    ]);
  });

  test('merges segments if they become adjacent', () => {
    const seekPosition = 30;
    const playedSegments = [
      [30, 50],
      [20, 29],
      [80, 90],
      [60, 70],
    ];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([
      [20, 50],
      [60, 70],
      [80, 90],
    ]);
  });

  test('inserts a new segment if seekPosition jumps', () => {
    const seekPosition = 100;
    const playedSegments = [
      [30, 50],
      [20, 29],
      [80, 90],
      [60, 70],
    ];

    const newPlayedSegments = applySeekPositionToPlayedSegments(
      seekPosition,
      playedSegments,
    );

    expect(newPlayedSegments).toEqual([
      [30, 50],
      [20, 29],
      [80, 90],
      [60, 70],
      [100, 100],
    ]);
  });

  test('builds the list of played segments when fed with a list of seek positions', () => {
    const finalPlayedSegmewnts = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24, 25, 5, 6, 7, 8, 9,
      10, 11, 12, 13, 14, 15,
    ].reduce(
      (playedSegments, seekPosition) =>
        applySeekPositionToPlayedSegments(seekPosition, playedSegments),
      [],
    );

    expect(finalPlayedSegmewnts).toEqual([
      [0, 15],
      [20, 25],
    ]);
  });
});

describe('updatePlayedSegmentsInScheduledTracks', () => {
  test('does nothing if the scheduled track does not have a queue item ID', () => {
    const zonesSeekChangedMessage = [
      {
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        queueTimeRemaining: 4299,
        seekPosition: 225,
      },
    ];
    const scheduledTracks = [stWeen01Wiim];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1115722,
        length: 228,
        imageKey: '33e959e7c3411302f3583d70ab7fcd41',
        nowPlaying: {
          roonArtistName: 'Makaya McCraven',
          roonAlbumName: 'Universal Beings',
          roonTrackName: 'Mantra',
        },
      },
      '160158f78109afd4b2d01d3b44e0d50be5bb': null,
      '1601f786e879b107e5e4d9555a47bc6e83a1': null,
      '1601fa3b3ee4f063ed8d5549632fd4e18fcf': null,
    };
    const timestamp = toIso8601(new Date(2025, 4, 13, 17, 19, 23, 29));

    const newScheduledTracks = updatePlayedSegmentsInScheduledTracks({
      zonesSeekChangedMessage,
      scheduledTracks,
      playingTracks,
      timestamp,
    });

    expect(newScheduledTracks).toEqual(scheduledTracks);
  });

  test('does nothing if the scheduled track is not the playing track', () => {
    const zonesSeekChangedMessage = [
      {
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        queueTimeRemaining: 4299,
        seekPosition: 111,
      },
    ];
    const scheduledTracks = [{ ...stWeen01Wiim, queueItemId: 888888 }];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1115722,
        length: 228,
        imageKey: '33e959e7c3411302f3583d70ab7fcd41',
        nowPlaying: {
          roonArtistName: 'Makaya McCraven',
          roonAlbumName: 'Universal Beings',
          roonTrackName: 'Mantra',
        },
      },
      '160158f78109afd4b2d01d3b44e0d50be5bb': null,
      '1601f786e879b107e5e4d9555a47bc6e83a1': null,
      '1601fa3b3ee4f063ed8d5549632fd4e18fcf': null,
    };
    const timestamp = toIso8601(new Date(2025, 4, 13, 17, 19, 23, 29));

    const newScheduledTracks = updatePlayedSegmentsInScheduledTracks({
      zonesSeekChangedMessage,
      scheduledTracks,
      playingTracks,
      timestamp,
    });

    expect(newScheduledTracks).toEqual(scheduledTracks);
  });

  test('updates played segements and lastPlayed if playing track refers to scheduled track', () => {
    const zonesSeekChangedMessage = [
      {
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        queueTimeRemaining: 4299,
        seekPosition: 111,
      },
    ];
    const scheduledTracks = [{ ...stWeen01Wiim, queueItemId: 1115722 }];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1115722,
        length: 228,
        imageKey: '33e959e7c3411302f3583d70ab7fcd41',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: 'I’m Holding You',
        },
      },
      '160158f78109afd4b2d01d3b44e0d50be5bb': null,
      '1601f786e879b107e5e4d9555a47bc6e83a1': null,
      '1601fa3b3ee4f063ed8d5549632fd4e18fcf': null,
    };
    const timestamp = toIso8601(new Date(2025, 4, 13, 17, 19, 23, 29));

    const newScheduledTracks = updatePlayedSegmentsInScheduledTracks({
      zonesSeekChangedMessage,
      scheduledTracks,
      playingTracks,
      timestamp,
    });

    expect(newScheduledTracks[0]).toEqual({
      ...scheduledTracks[0],
      playedSegments: [[111, 111]],
      lastPlayed: timestamp,
    });
  });

  test('updates played segments when fed with a list of seek changed messages', () => {
    const seekPositions = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24, 25, 5, 6, 7, 8, 9,
      10, 11, 12, 13, 14, 15,
    ];
    const zonesSeekChangedMessages = seekPositions.map((seekPosition) => [
      {
        zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
        queueTimeRemaining: 4000 - seekPosition,
        seekPosition: seekPosition,
      },
    ]);
    const scheduledTracks = [{ ...stWeen01Wiim, queueItemId: 1115722 }];
    const playingTracks = {
      '1601f4f798ff1773c83b77e489eaff98f7f4': {
        queueItemId: 1115722,
        length: 228,
        imageKey: '33e959e7c3411302f3583d70ab7fcd41',
        nowPlaying: {
          roonArtistName: 'Ween',
          roonAlbumName: '12 Golden Country Greats',
          roonTrackName: 'I’m Holding You',
        },
      },
      '160158f78109afd4b2d01d3b44e0d50be5bb': null,
      '1601f786e879b107e5e4d9555a47bc6e83a1': null,
      '1601fa3b3ee4f063ed8d5549632fd4e18fcf': null,
    };
    const timestamp = toIso8601(new Date(2025, 4, 13, 17, 19, 23, 29));

    const newScheduledTracks = zonesSeekChangedMessages.reduce(
      (currentScheduledTracks, zonesSeekChangedMessage) =>
        updatePlayedSegmentsInScheduledTracks({
          zonesSeekChangedMessage,
          scheduledTracks: currentScheduledTracks,
          playingTracks,
          timestamp,
        }),
      scheduledTracks,
    );

    expect(newScheduledTracks[0]).toEqual({
      ...scheduledTracks[0],
      playedSegments: [
        [0, 15],
        [20, 25],
      ],
      lastPlayed: timestamp,
    });
  });
});
