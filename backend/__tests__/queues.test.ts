import { ZodError } from 'zod';

import { extractQueueItems } from '../src/queues';

describe('extractQueueItems', () => {
  const items = [
    {
      queueItemId: 846769,
      length: 479,
      imageKey: '5ddef6d2e2d390c25db25aad80ae9c87',
      oneLine: {
        line1: 'Hospital Chapel - Burial',
      },
      twoLine: {
        line1: 'Hospital Chapel',
        line2: 'Burial',
      },
      threeLine: {
        line1: 'Hospital Chapel',
        line2: 'Burial',
        line3: 'Streetlands EP',
      },
    },
  ];

  test('returns items if items key is present', () => {
    const queue = {
      items,
    };

    const queueItems = extractQueueItems(queue);

    expect(queueItems).toEqual(items);
  });

  test('returns items if no remove operation in queue', () => {
    const queue = {
      changes: [
        {
          operation: 'insert',
          index: 0,
          items,
        },
      ],
    };

    const queueItems = extractQueueItems(queue);

    expect(queueItems).toEqual(items);
  });

  test('returns items if remove and insert operations in queue', () => {
    const queue = {
      changes: [
        {
          operation: 'remove',
          index: 0,
          count: 2,
        },
        {
          operation: 'insert',
          index: 0,
          items,
        },
      ],
    };

    const queueItems = extractQueueItems(queue);

    expect(queueItems).toEqual(items);
  });

  test('returns an empty list if all items are removed', () => {
    const queue = {
      changes: [
        {
          operation: 'remove',
          index: 0,
          count: 5,
        },
      ],
    };

    const queueItems = extractQueueItems(queue);

    expect(queueItems).toEqual([]);
  });

  test('throws error if queue has unexpected shape', () => {
    const queue = {
      somethingElse: items,
    };

    expect(() => extractQueueItems(queue)).toThrow(ZodError);
  });
});
