import type { ZonesSeekChangedMessage } from './zonesSeekChangedMessage.js';
import type { RoonAlbum } from './roonAlbum.js';
import type { ZoneMap } from './zoneMap.js';
import type { RoonQueueItem } from './roonQueueItem.js';
import type { AlbumAggregate } from './albumAggregate.js';

type ServerToClientEvents = {
  albumUpdate: (album: AlbumAggregate) => void;
  albums: (albums: AlbumAggregate[]) => void;
  coreUrl: (coreUrl: string) => void;
  initialState: (initialState: ZoneMap) => void;
  queueChanged: (queueChanged: {
    zoneId: string;
    queueItems: RoonQueueItem[];
  }) => void;
  zonesSeekChanged: (message: ZonesSeekChangedMessage) => void;
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
