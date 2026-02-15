type ZonePlayingState = {
  zoneId: string;
  previousQueueItemId: number | null;
  previousPlayedSegments: number[][];
  previousPlayId: string | null;
};

export type { ZonePlayingState };
