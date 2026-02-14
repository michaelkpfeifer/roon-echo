import { z } from 'zod';

const RawZonesSeekChangedMessageSchema = z.array(
  z.object({
    zoneId: z.string(),
    queueTimeRemaining: z.number(),
    seekPosition: z.number().nullable().optional(),
  }),
);

export { RawZonesSeekChangedMessageSchema };
