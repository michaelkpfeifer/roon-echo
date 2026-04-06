import type { z } from 'zod';

import type { RawRoonQueueSchema } from '../schemas/rawRoonQueue.js';

type RawRoonQueue = z.infer<typeof RawRoonQueueSchema>;

export type { RawRoonQueue };
