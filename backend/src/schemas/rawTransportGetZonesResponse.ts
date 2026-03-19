import { z } from 'zod';

const RawTransportGetZonesResponseSchema = z.array(
  z.object({
    zone_id: z.string(),
    display_name: z.string(),
  }),
);

export { RawTransportGetZonesResponseSchema };
