import { z } from 'zod';

const RawMbCandidateSearchResponseSchema = z.object({
  releases: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
    }),
  ),
});

export { RawMbCandidateSearchResponseSchema };
