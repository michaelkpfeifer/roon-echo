import { z } from 'zod';

const RawRoonAlbumSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageKey: z.string(),
  itemKey: z.string(),
  hint: z.string(),
});

export { RawRoonAlbumSchema };
