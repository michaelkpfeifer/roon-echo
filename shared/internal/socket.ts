import type { ZonesSeekChangedMessage } from './zonesSeekChangedMessage.js';

type ServerToClientEvents = {
  zonesSeekChanged: (message: ZonesSeekChangedMessage) => void;
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
