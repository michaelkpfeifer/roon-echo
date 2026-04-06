import type { z } from 'zod';

import type { RawRoonQueueItemSchema } from '../schemas/rawRoonQueueItem.js';

type RawRoonQueueItem = z.infer<typeof RawRoonQueueItemSchema>;

export type { RawRoonQueueItem };
