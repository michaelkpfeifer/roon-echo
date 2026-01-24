import { z } from 'zod';

const RawRoonTrackSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageKey: z.null(),
  itemKey: z.string(),
});

export { RawRoonTrackSchema };
