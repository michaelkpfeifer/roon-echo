import type { z } from 'zod';

import type { RawZonesSeekChangedMessageSchema } from '../schemas/rawZonesSeekChangedMessage.js';

type RawZonesSeekChangedMessage = z.infer<
  typeof RawZonesSeekChangedMessageSchema
>;

export type { RawZonesSeekChangedMessage };
