import { z } from 'zod';

const RawRoonTrackSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  itemKey: z.string(),
});

export { RawRoonTrackSchema };
