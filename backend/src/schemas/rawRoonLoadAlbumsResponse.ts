import { z } from 'zod';

import { RawRoonAlbumSchema } from './rawRoonAlbum';
import { RawRoonAlbum } from '../../../shared/external/rawRoonAlbum';

const RawRoonLoadAlbumsResponseSchema = z.object({
  items: z.array(z.unknown()).transform((items) => {
    return items.reduce((acc: RawRoonAlbum[], item) => {
      const result = RawRoonAlbumSchema.safeParse(item);

      if (result.success) {
        acc.push(result.data);
      } else {
        /* eslint-disable no-console */
        console.warn(
          `[Validation Failed] schema: RawRoonLoadAlbumsResponseSchema, data: ${JSON.stringify(item)}`,
        );
        /* eslint-enable no-console */
        result.error.issues.forEach((issue) => {
          /* eslint-disable no-console */
          console.warn(`  - Path: ${issue.path.join('.')}`);
          console.warn(`  - Reason: ${issue.message}`);
          /* eslint-enable no-console */
        });
      }
      return acc;
    }, []);
  }),
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
