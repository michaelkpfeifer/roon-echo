import type { z } from 'zod';

import type { RawTransportGetZonesResponseSchema } from '../schemas/rawTransportGetZonesResponse.js';

type RawTransportGetZonesResponse = z.infer<
  typeof RawTransportGetZonesResponseSchema
>;

export type { RawTransportGetZonesResponse };
