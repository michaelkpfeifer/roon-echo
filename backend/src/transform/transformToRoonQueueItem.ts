import { RawRoonQueueItem } from '@shared/external/rawRoonQueueItem';
import { RoonQueueItem } from '@shared/internal/roonQueueItem';

const transformToRoonQueueItem = (raw: RawRoonQueueItem): RoonQueueItem => ({
  queueItemId: raw.queueItemId,
  length: raw.length,
  imageKey: raw.imageKey,
  oneLine: { ...raw.oneLine },
  twoLine: { ...raw.twoLine },
  threeLine: { ...raw.threeLine },
});

export { transformToRoonQueueItem };
