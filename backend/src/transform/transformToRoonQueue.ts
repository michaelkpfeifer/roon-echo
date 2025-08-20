import { RawRoonQueue } from '@shared/external/rawRoonQueue';
import { RoonQueue } from '@shared/internal/roonQueue';
import { transformToRoonQueueItem } from './transformToRoonQueueItem';

const transformToRoonQueue = (rawQueue: RawRoonQueue): RoonQueue => {
  return rawQueue.map(transformToRoonQueueItem);
}

export { transformToRoonQueue };
