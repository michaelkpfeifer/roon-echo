import { z } from 'zod';

const RawRoonTrackSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageKey: z.null(),
  itemKey: z.string(),
  hint: z.literal('action_list'),
});

export { RawRoonTrackSchema };
