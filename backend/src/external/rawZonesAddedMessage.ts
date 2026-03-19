import type { z } from 'zod';

import type { RawZonesAddedMessageSchema } from '../schemas/rawZonesAddedMessage.js';

type RawZonesAddedMessage = z.infer<typeof RawZonesAddedMessageSchema>;

export type { RawZonesAddedMessage };
