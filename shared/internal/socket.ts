import type { RoonAlbum } from './roonAlbum.js';
import type { Zone } from './zone.js';
import type { RoonQueueItem } from './roonQueueItem.js';
import type { AlbumAggregate } from './albumAggregate.js';
import type { ZoneSeekPosition } from './zoneSeekPosition.js';

type ServerToClientEvents = {
  albumUpdate: (album: AlbumAggregate) => void;
  albums: (albums: AlbumAggregate[]) => void;
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
  albumAddNext: (roonAlbumAndZone: {
    roonAlbum: RoonAlbum;
    zoneId: string;
  }) => void;
  pause: (pause: { zoneId: string }) => void;
  play: (play: { zoneId: string }) => void;
  trackAddNext: (keyPositionZone: {
    albumKey: string;
    roonPosition: number;
    zoneId: string;
  }) => void;
};

export type { ClientToServerEvents, ServerToClientEvents };
