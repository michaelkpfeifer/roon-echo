import { z } from 'zod';

import { RawRoonAlbumSchema } from './rawRoonAlbum';

const RawRoonLoadAlbumsResponseSchema = z.object({
  items: z.array(RawRoonAlbumSchema),
  offset: z.number(),
  list: z.object({
    level: z.number(),
    title: z.literal('Albums'),
    subtitle: z.null(),
    imageKey: z.null(),
    count: z.number(),
    displayOffset: z.null(),
  }),
});

export { RawRoonLoadAlbumsResponseSchema };
