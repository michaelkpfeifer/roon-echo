import type { RawRoonQueue } from '../../../shared/external/rawRoonQueue.js';
import type { RawRoonQueueItem } from '../../../shared/external/rawRoonQueueItem.js';
import type { RoonQueue } from '../../../shared/internal/roonQueue.js';
import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem.js';

const transformToRoonQueueItem = (raw: RawRoonQueueItem): RoonQueueItem => ({
  queueItemId: raw.queueItemId,
  length: raw.length,
  imageKey: raw.imageKey,
  oneLine: { ...raw.oneLine },
  twoLine: { ...raw.twoLine },
  threeLine: { ...raw.threeLine },
});

const transformToRoonQueue = (rawQueue: RawRoonQueue): RoonQueue =>
  rawQueue.map(transformToRoonQueueItem);

export { transformToRoonQueue, transformToRoonQueueItem };
