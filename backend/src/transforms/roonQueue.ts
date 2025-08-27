/* eslint-disable import/no-extraneous-dependencies */
import { RawRoonQueueItem } from '@shared/external/rawRoonQueueItem';
import { RoonQueueItem } from '@shared/internal/roonQueueItem';
import { RawRoonQueue } from '@shared/external/rawRoonQueue';
import { RoonQueue } from '@shared/internal/roonQueue';
/* eslint-enable import/no-extraneous-dependencies */

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
