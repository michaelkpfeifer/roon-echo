import type { z } from 'zod';

import type { RawZonesSeekChangedMessageSchema } from '../schemas/rawZonesSeekChangedMessage';

type RawZonesSeekChangedMessage = z.infer<
  typeof RawZonesSeekChangedMessageSchema
>;

export { RawZonesSeekChangedMessage };
