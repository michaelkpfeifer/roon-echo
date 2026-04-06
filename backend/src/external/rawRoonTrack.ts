import type { z } from 'zod';

import type { RawRoonTrackSchema } from '../schemas/rawRoonTrack.js';

type RawRoonTrack = z.infer<typeof RawRoonTrackSchema>;

export type { RawRoonTrack };
