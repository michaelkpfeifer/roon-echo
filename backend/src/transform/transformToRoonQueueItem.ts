import { RawRoonQueueItem } from "../types/external/rawRoonQueueItem";
import { RoonQueueItem } from "../types/internal/roonQueueItem";

const transformToRoonQueueItem = (raw: RawRoonQueueItem): RoonQueueItem => {
  return {
    queueItemId: raw.queueItemId,
    length: raw.length,
    imageKey: raw.imageKey,
    oneLine: { ...raw.oneLine },
    twoLine: { ...raw.twoLine },
    threeLine: { ...raw.threeLine },
  };
}

export { transformToRoonQueueItem };
