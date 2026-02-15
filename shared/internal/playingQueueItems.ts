import type { RoonQueueItem } from './roonQueueItem.js';

type PlayingQueueItems = {
  [key: string]: RoonQueueItem | null;
};

export type { PlayingQueueItems };
