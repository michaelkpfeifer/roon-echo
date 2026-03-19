import { z } from 'zod';

const RawZonesAddedMessageSchema = z.array(
  z.object({
    zoneId: z.string(),
    displayName: z.string(),
  }),
);

export { RawZonesAddedMessageSchema };
