import type { RawZonesSeekChangedMessage } from '../external/rawZonesSeekChangedMessage';
import type { ZoneSeekPosition } from '../../../shared/internal/zoneSeekPosition';

const transformToZoneSeekPositions = (
  rawZonesSeekChangedMessage: RawZonesSeekChangedMessage,
): ZoneSeekPosition[] => rawZonesSeekChangedMessage;

export { transformToZoneSeekPositions };
