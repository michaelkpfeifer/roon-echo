import type { RawOneLine, RawTwoLine, RawThreeLine } from './rawNLine.js';

type RawRoonQueueItem = {
  queueItemId: number;
  length: number;
  imageKey: string;
  oneLine: RawOneLine;
  twoLine: RawTwoLine;
  threeLine: RawThreeLine;
};

export type { RawRoonQueueItem };
