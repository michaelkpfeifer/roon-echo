import { describe, it, expect } from 'vitest';

import type { RawRoonQueueItem } from '../../../shared/external/rawRoonQueueItem.js';
import {
  transformToRoonQueueItem,
  transformToRoonQueue,
} from '../../src/transforms/roonQueue.js';

describe('transformToRoonQueueitem', () => {
  it('transforms a single RawRoonQueueItem into a RoonQueueItem', () => {
    const queueItem = {
      queueItemId: 1,
      length: 300,
      imageKey: 'abc123',
      oneLine: { line1: 'Track Title' },
      twoLine: { line1: 'Track Title', line2: 'Some Artist' },
      threeLine: {
        line1: 'Track Title',
        line2: 'Some Artist',
        line3: 'Some Album',
      },
    };

    const raw: RawRoonQueueItem = queueItem;
    const result = transformToRoonQueueItem(raw);

    expect(result).toEqual(queueItem);
  });
});

describe('transformToRoonQueue', () => {
  it('transforms a RawRoonQueue into a RoonQueue', () => {
    const queueItem1 = {
      queueItemId: 1,
      length: 301,
      imageKey: 'abc123_1',
      oneLine: { line1: 'Track Title 1' },
      twoLine: { line1: 'Track Title 1', line2: 'Some Artist 1' },
      threeLine: {
        line1: 'Track Title 1',
        line2: 'Some Artist 1',
        line3: 'Some Album 1',
      },
    };

    const queueItem2 = {
      queueItemId: 2,
      length: 302,
      imageKey: 'abc123_2',
      oneLine: { line1: 'Track Title 2' },
      twoLine: { line1: 'Track Title 2', line2: 'Some Artist 2' },
      threeLine: {
        line1: 'Track Title 2',
        line2: 'Some Artist 2',
        line3: 'Some Album 2',
      },
    };

    const rawQueue: RawRoonQueueItem[] = [queueItem1, queueItem2];
    const result = transformToRoonQueue(rawQueue);

    expect(result).toEqual([queueItem1, queueItem2]);
  });
});
