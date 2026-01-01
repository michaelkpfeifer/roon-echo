import { z } from 'zod';

const RawMbFetchReleaseResponseMediaSchema = z.object({
  media: z.array(
    z.object({
      tracks: z.array(z.object({})).nullish(),
    }),
  ),
});

export { RawMbFetchReleaseResponseMediaSchema };
