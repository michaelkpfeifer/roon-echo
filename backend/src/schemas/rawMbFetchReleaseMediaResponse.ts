import { z } from 'zod';

const RawMbFetchReleaseResponseMediaSchema = z.object({
  media: z.array(
    z.object({
      tracks: z.nullable(z.array(z.object({}))),
    }),
  ),
});

export { RawMbFetchReleaseResponseMediaSchema };
