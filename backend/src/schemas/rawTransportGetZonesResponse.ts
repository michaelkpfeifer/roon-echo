import { z } from 'zod';

import { RawNowPlayingSchema } from './rawNowPlaying.js';

const RawTransportGetZonesResponseSchema = z.array(
  z.object({
    zoneId: z.string(),
    displayName: z.string(),
    state: z.string(),
    queueTimeRemaining: z.number().nullable().optional().default(null),
    nowPlaying: z.nullable(RawNowPlayingSchema).optional().default(null),
  }),
);

export { RawTransportGetZonesResponseSchema };
