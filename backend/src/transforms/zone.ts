import type { Zone } from '../../../shared/internal/zone.js';
import type { RawTransportGetZonesResponse } from '../external/rawTransportGetZonesResponse.js';
import type { RawZonesAddedMessage } from '../external/rawZonesAddedMessage.js';
import type { RawZonesChangedMessage } from '../external/rawZonesChangedMessage.js';

const transformAdditionsToZones = (
  rawZonesAddedMessage: RawZonesAddedMessage,
): Zone[] => {
  return rawZonesAddedMessage;
};

const transformChangesToZones = (
  rawZonesChangedMessage: RawZonesChangedMessage,
): Zone[] => {
  return rawZonesChangedMessage;
};

const transformTransportGetZones = (
  rawTransportGetZonesResponse: RawTransportGetZonesResponse,
) => {
  return rawTransportGetZonesResponse;
};

export {
  transformAdditionsToZones,
  transformChangesToZones,
  transformTransportGetZones,
};
