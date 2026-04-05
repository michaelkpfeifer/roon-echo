import type { z } from 'zod';

import type { RawRoonAlbumSchema } from '../schemas/rawRoonAlbum.js';

type RawRoonAlbum = z.infer<typeof RawRoonAlbumSchema>;

export type { RawRoonAlbum };
