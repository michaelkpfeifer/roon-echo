import type { ZonesSeekChangedMessage } from './zonesSeekChangedMessage.js';
import type { RoonAlbum } from './roonAlbum.js';
import type { ZoneMap } from './zoneMap.js';

type ServerToClientEvents = {
  initialState: (initialState: ZoneMap) => void;
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
