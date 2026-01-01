import { z } from 'zod';

const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullish() // Handles missing key or explicit null
  .catch(null); // Converts invalid strings OR undefined into null

const RawMbFetchReleaseResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: DateSchema,
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
          id: z.string(),
          length: z.nullable(z.number()),
          title: z.string(),
          position: z.number(),
          number: z.string(),
          recording: z.object({
            length: z.nullable(z.number()),
          }),
        }),
      ),
    }),
  ),
});

export { RawMbFetchReleaseResponseSchema };
