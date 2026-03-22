import { z } from 'zod';

import { RawNowPlayingSchema } from './rawNowPlaying.js';

const RawZonesChangedMessageSchema = z.array(
  z.object({
    zoneId: z.string(),
    displayName: z.string(),
    state: z.string(),
    queueTimeRemaining: z.number(),
    nowPlaying: z.nullable(RawNowPlayingSchema),
  }),
);

export { RawZonesChangedMessageSchema };
