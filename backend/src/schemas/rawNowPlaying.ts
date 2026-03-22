import { z } from 'zod';

import {
  RawOneLineSchema,
  RawTwoLineSchema,
  RawThreeLineSchema,
} from './rawNLine.js';

const RawNowPlayingSchema = z.object({
  seekPosition: z.nullable(z.number()),
  length: z.number(),
  imageKey: z.string(),
  oneLine: RawOneLineSchema,
  twoLine: RawTwoLineSchema,
  threeLine: RawThreeLineSchema,
});

export { RawNowPlayingSchema };
