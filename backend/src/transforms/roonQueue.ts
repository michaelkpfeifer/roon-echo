import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem.js';
import type { RawRoonQueueItem } from '../external/rawRoonQueueItem.js';

const transformToRoonQueueItem = (raw: RawRoonQueueItem): RoonQueueItem => ({
  queueItemId: raw.queueItemId,
  length: raw.length,
  imageKey: raw.imageKey,
  oneLine: { ...raw.oneLine },
  twoLine: { ...raw.twoLine },
  threeLine: { ...raw.threeLine },
});

export { transformToRoonQueueItem };
