import type { OneLine, TwoLine, ThreeLine } from './nLine.ts';

type NowPlaying = {
  seekPosition: number | null;
  length: number;
  imageKey: string;
  oneLine: OneLine;
  twoLine: TwoLine;
  threeLine: ThreeLine;
};

export type { NowPlaying };
