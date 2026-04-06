import type { z } from 'zod';

import type {
  RawOneLineSchema,
  RawTwoLineSchema,
  RawThreeLineSchema,
} from '../schemas/rawNLine.js';

type RawOneLine = z.infer<typeof RawOneLineSchema>;

type RawTwoLine = z.infer<typeof RawTwoLineSchema>;

type RawThreeLine = z.infer<typeof RawThreeLineSchema>;

export type { RawOneLine, RawTwoLine, RawThreeLine };
