import { RawRoonQueue } from '../../../shared/external/rawRoonQueue';
import { RawRoonQueueItem } from '../../../shared/external/rawRoonQueueItem';
import { RoonQueue } from '../../../shared/internal/roonQueue';
import { RoonQueueItem } from '../../../shared/internal/roonQueueItem';

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
