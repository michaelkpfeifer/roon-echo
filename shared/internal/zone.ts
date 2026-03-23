import type { NowPlaying } from './nowPlaying.js';

type Zone = {
  zoneId: string;
  displayName: string;
  state: string;
  queueTimeRemaining: number | null;
  nowPlaying: NowPlaying | null;
};

export type { Zone };
