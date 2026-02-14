import { describe, test, expect } from 'vitest';

import {
  applySeekPositionToPlayedSegments,
  getPlayedTime,
  mergePlayedSegments,
} from '../src/plays.js';

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

describe('getPlayedTime', () => {
  test('returns 0 if there are no played segments', () => {
    const playedSegments = [];

    expect(getPlayedTime(playedSegments)).toEqual(0);
  });

  test('returns the sum of durations of the played segments', () => {
    const playedSegments = [
      [30, 50],
      [20, 29],
      [80, 90],
      [60, 70],
    ];

    expect(getPlayedTime(playedSegments)).toEqual(20 + 9 + 10 + 10);
  });
});
