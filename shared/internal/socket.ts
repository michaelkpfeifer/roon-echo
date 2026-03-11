import type { ZonesSeekChangedMessage } from './zonesSeekChangedMessage.js';

type ServerToClientEvents = {
  zonesSeekChanged: (message: ZonesSeekChangedMessage) => void;
type ClientToServerEvents = {

export type { ClientToServerEvents, ServerToClientEvents };
