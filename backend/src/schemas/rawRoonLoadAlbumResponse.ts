import { z } from 'zod';

import { RawRoonTrackSchema } from './rawRoonTrack';

const RawRoonLoadAlbumResponseSchema = z
  .any()
  .transform((data) => ({ ...data, items: data.items.slice(1) }))
  .pipe(
    z.object({
      items: z.array(RawRoonTrackSchema),
      offset: z.literal(0),
      list: z.object({
        level: z.number(),
        title: z.string(),
        subtitle: z.string(),
        imageKey: z.string(),
        count: z.number(),
        displayOffset: z.null(),
      }),
    }),
  );

export { RawRoonLoadAlbumResponseSchema };
