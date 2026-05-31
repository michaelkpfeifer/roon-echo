import type { Zone } from './zone.js';
import type { RoonQueueItem } from './roonQueueItem.js';
import type { AlbumAggregate } from './albumAggregate.js';
import type { AlbumSchedulingSpecification } from './albumSchedulingSpecification.js';
import type { TrackSchedulingSpecification } from './trackSchedulingSpecification.js';
import type { ZoneSeekPosition } from './zoneSeekPosition.js';

type ServerToClientEvents = {
  albumAggregateUpdate: (album: AlbumAggregate) => void;
  albumAggregates: (albums: AlbumAggregate[]) => void;
  coreUrl: (coreUrl: string) => void;
  initialState: (initialState: { zones: Record<string, Zone> }) => void;
  queueChanged: (queueChanged: {
    zoneId: string;
    queueItems: RoonQueueItem[];
  }) => void;
  zonesChanged: (message: { zones: Record<string, Zone> }) => void;
  zonesSeekChanged: (message: Record<string, ZoneSeekPosition>) => void;
};

type ClientToServerEvents = {
  scheduleAlbum: (
    albumSchedulingSpecification: AlbumSchedulingSpecification,
  ) => void;
  pause: (pause: { zoneId: string }) => void;
  play: (play: { zoneId: string }) => void;
  scheduleTrack: (
    trackSchedulingSpecification: TrackSchedulingSpecification,
  ) => void;
};

export type { ClientToServerEvents, ServerToClientEvents };
