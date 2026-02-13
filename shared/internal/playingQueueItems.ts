import type { RoonQueueItem } from './roonQueueItem';

type PlayingQueueItems = {
  [key: string]: RoonQueueItem | null;
};

export { PlayingQueueItems };
