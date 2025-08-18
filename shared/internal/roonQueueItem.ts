import { OneLine, TwoLine, ThreeLine } from './nLine';

type RoonQueueItem = {
  queueItemId: number;
  length: number;
  imageKey: string;
  oneLine: OneLine;
  twoLine: TwoLine;
  threeLine: ThreeLine;
};

export { RoonQueueItem };
