import fp from 'lodash/fp.js';
import type { RoonQueue } from '@shared/internal/roonQueue';
import { hasArray } from './typeGuards.js';
import type { RawRoonQueueItem } from '@shared/external/rawRoonQueueItem.js';
import { transformToRoonQueueItem } from './transform/transformToRoonQueueItem.js';
import { RawRoonQueueSchema } from './schemas/rawRoonQueue.js';

const isRawRoonQueueWithItems = (
  obj: unknown,
): obj is { items: RawRoonQueueItem[] } => hasArray('items')(obj);

const isRawRoonQueueWithChanges = (obj: unknown): obj is { changes: any[] } =>
  hasArray('changes')(obj);

const parseQueue = (queue: unknown) => RawRoonQueueSchema.parse(queue);

const extractQueueItems = (queue: unknown): RoonQueue => {
  /* eslint-disable no-console */
  console.log('queues.ts: extractQueueItems(): queue:', queue);
  /* eslint-enable no-console */

  const parsed = parseQueue(queue);

  if (isRawRoonQueueWithItems(parsed)) {
    return parsed.items.map(transformToRoonQueueItem);
  }

  if (isRawRoonQueueWithChanges(parsed)) {
    const insertOp = fp.find({ operation: 'insert' }, parsed.changes);
    if (insertOp && 'items' in insertOp && Array.isArray(insertOp.items)) {
      return insertOp.items.map(transformToRoonQueueItem);
    }

    return [];
  }

  throw new Error('Error: Cannot extract items from queue');
};

export { extractQueueItems };
