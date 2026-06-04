import { z } from 'zod';

import {
  RawOneLineSchema,
  RawTwoLineSchema,
  RawThreeLineSchema,
} from './rawNLine.js';

const RawRoonQueueItemSchema = z.object({
  queueItemId: z.number(),
  length: z.number(),
  imageKey: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val ?? null),
  oneLine: RawOneLineSchema,
  twoLine: RawTwoLineSchema,
  threeLine: RawThreeLineSchema,
});

export { RawRoonQueueItemSchema };
