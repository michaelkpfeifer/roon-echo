import type { OneLine, TwoLine, ThreeLine } from './nLine.ts';

type NowPlaying = {
  seekPosition: number;
  length: number;
  imageKey: string;
  artistImageKeys: string[];
  oneLine: OneLine;
  TwoLine: TwoLine;
  ThreeLine: ThreeLine;
};

export type { NowPlaying };
