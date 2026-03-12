import type { ZonesSeekChangedMessage } from './zonesSeekChangedMessage.js';

type ServerToClientEvents = {
  zonesSeekChanged: (message: ZonesSeekChangedMessage) => void;
type ClientToServerEvents = {
  pause: (pause: { zoneId: string }) => void;
  play: (play: { zoneId: string }) => void;

export type { ClientToServerEvents, ServerToClientEvents };
