import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem';

type AppState = {
  queues: Record<string, RoonQueueItem[]>;
};

export type { AppState };
