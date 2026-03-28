import { z } from 'zod';

import { RawRoonTrackSchema } from './rawRoonTrack.js';

const RawRoonLoadAlbumResponseSchema = z
  .any()
  .transform((data) => ({ ...data, items: data.items.slice(1) }))
  .pipe(
    z.object({
      items: z.array(RawRoonTrackSchema),
      list: z.object({
        title: z.string(),
        subtitle: z.string(),
        imageKey: z.string(),
        count: z.number(),
      }),
    }),
  );

export { RawRoonLoadAlbumResponseSchema };
