import { z } from 'zod';

const RawOneLineSchema = z.object({
  line1: z.string(),
});

const RawTwoLineSchema = z.object({
  line1: z.string(),
  line2: z.string(),
})

const RawThreeLineSchema = z.object({
  line1: z.string(),
  line2: z.string(),
  line3: z.string(),
});

export { RawOneLineSchema, RawTwoLineSchema, RawThreeLineSchema };
