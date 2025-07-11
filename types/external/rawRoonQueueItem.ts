import { RawOneLine, RawTwoLine, RawThreeLine } from './rawNLine';

type RawRoonQueueItem = {
  queueItemId: number;
  length: number;
  imageKey: string;
  oneLine: RawOneLine;
  twoLine: RawTwoLine;
  threeLine: RawThreeLine;
};

export { RawRoonQueueItem };
