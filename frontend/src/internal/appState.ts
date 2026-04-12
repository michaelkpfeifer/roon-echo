import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem';

type AppState = {
  queues: Record<string, RoonQueueItem[]>;
  isZonesModalOpen: boolean;
  tmpSelectedZoneId: string | null;
};

export type { AppState };
