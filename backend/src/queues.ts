import fp from 'lodash/fp.js';
import type { RoonQueue } from './types/internal/roonQueue';
import { hasArray } from './typeGuards.js';
import type { RawRoonQueueItem } from './types/external/rawRoonQueueItem.js';
import { transformToRoonQueueItem } from './transform/transformToRoonQueueItem.js';

function isRawRoonQueueWithItems(obj: unknown): obj is { items: RawRoonQueueItem[] } {
  return hasArray('items')(obj);
}

function isRawRoonQueueWithChanges(obj: unknown): obj is { changes: any[] } {
  return hasArray('changes')(obj);
}

const extractQueueItems = (queue: unknown): RoonQueue => {
  if (isRawRoonQueueWithItems(queue)) {
    return queue.items.map(transformToRoonQueueItem);
  }

  if (isRawRoonQueueWithChanges(queue)) {
    const insertOp = fp.find({ operation: 'insert' }, queue.changes);
    if (insertOp && 'items' in insertOp && Array.isArray(insertOp.items)) {
      return insertOp.items.map(transformToRoonQueueItem);
    }

    return [];
  }

  throw new Error('Error: Cannot extract items from queue');
};

/* eslint-disable import/prefer-default-export */
export { extractQueueItems };
/* eslint-disable import/prefer-default-export */
