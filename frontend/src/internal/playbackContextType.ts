import type { RoonQueueItem } from '../../../shared/internal/roonQueueItem';
import type { Zone } from '../../../shared/internal/zone';

type PlaybackContextType = {
  zones: Record<string, Zone>;
  queues: Record<string, RoonQueueItem[]>;
};

export type { PlaybackContextType };
