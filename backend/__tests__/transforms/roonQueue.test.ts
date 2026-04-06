import { describe, it, expect } from 'vitest';

import type { RawRoonQueueItem } from '../../src/external/rawRoonQueueItem.js';
import { transformToRoonQueueItem } from '../../src/transforms/roonQueue.js';

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
