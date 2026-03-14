import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem';

type AppState = {
  albums: AlbumAggregate[];
  queues: Record<string, RoonQueueItem>;
  isZonesModalOpen: boolean;
  tmpSelectedZoneId: string | null;
};

export type { AppState };
