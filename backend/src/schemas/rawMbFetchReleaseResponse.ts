import { z } from 'zod';

const RawMbFetchReleaseResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string().optional(),
  'artist-credit': z.array(
    z.object({
      joinphrase: z.string(),
      artist: z.object({
        id: z.string(),
        disambiguation: z.string(),
        'sort-name': z.string(),
        name: z.string(),
      }),
    }),
  ),
  media: z.array(
    z.object({
      'track-count': z.number(),
      tracks: z.array(
        z.object({
          length: z.number(),
          title: z.string(),
          position: z.number(),
          number: z.string(),
        }),
      ),
    }),
  ),
});

export { RawMbFetchReleaseResponseSchema };
