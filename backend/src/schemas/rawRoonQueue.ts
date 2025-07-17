import { z } from 'zod';

import { RawRoonQueueItemSchema } from './rawRoonQueueItem.js';

const RemoveChangeSchema = z.object({
  operation: z.literal('remove'),
  index: z.number(),
  count: z.number(),
});

const InsertChangeSchema = z.object({
  operation: z.literal('insert'),
  index: z.number(),
  items: z.array(RawRoonQueueItemSchema),
});

const RawQueueChangesSchema = z.object({
  changes: z.array(z.union([RemoveChangeSchema, InsertChangeSchema])),
});

const RawQueueItemsSchema = z.object({
  items: z.array(RawRoonQueueItemSchema),
});

const RawRoonQueueSchema = z.union([
  RawQueueChangesSchema,
  RawQueueItemsSchema,
]);

export { RawRoonQueueSchema };
