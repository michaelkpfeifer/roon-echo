import { z } from 'zod';

const RawRoonAlbumSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  subtitle: z.string().refine((val) => val !== 'Unknown Artist', {
    message: 'Artist cannot be unknown',
  }),
  imageKey: z.string(),
  itemKey: z.string(),
  hint: z.string(),
});

export { RawRoonAlbumSchema };
