import { z } from 'zod';

const RawRoonTrackSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export { RawRoonTrackSchema };
