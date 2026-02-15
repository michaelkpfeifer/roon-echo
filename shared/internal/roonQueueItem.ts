import type { OneLine, TwoLine, ThreeLine } from './nLine.js';

type RoonQueueItem = {
  queueItemId: number;
  length: number;
  imageKey: string;
  oneLine: OneLine;
  twoLine: TwoLine;
  threeLine: ThreeLine;
};

export type { RoonQueueItem };
