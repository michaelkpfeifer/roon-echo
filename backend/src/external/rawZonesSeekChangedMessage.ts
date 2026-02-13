import { z } from 'zod';

import { RawZonesSeekChangedMessageSchema } from '../schemas/rawZonesSeekChangedMessage';

type RawZonesSeekChangedMessage = z.infer<
  typeof RawZonesSeekChangedMessageSchema
>;

export { RawZonesSeekChangedMessage };
