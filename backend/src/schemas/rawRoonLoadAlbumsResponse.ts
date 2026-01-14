import { z } from 'zod';

import { RawRoonAlbumSchema } from './rawRoonAlbum';
import { RawRoonAlbum } from '../../../shared/external/rawRoonAlbum';

const RawRoonLoadAlbumsResponseSchema = z.object({
  items: z.array(z.unknown()).transform((items) => {
    return items.filter((item) => {
      const validation = RawRoonAlbumSchema.safeParse(item);
      return validation.success;
    });
  }) as z.ZodType<RawRoonAlbum[]>,
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
