import type { z } from 'zod';

import type { RawZonesChangedMessageSchema } from '../schemas/rawZonesChangedMessage.js';

type RawZonesChangedMessage = z.infer<typeof RawZonesChangedMessageSchema>;

export type { RawZonesChangedMessage };
