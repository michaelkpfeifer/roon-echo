import type { ZoneSeekPosition } from '../../../shared/internal/zoneSeekPosition';
import type { RawZonesSeekChangedMessage } from '../external/rawZonesSeekChangedMessage';

const transformToZoneSeekPositions = (
  rawZonesSeekChangedMessage: RawZonesSeekChangedMessage,
): ZoneSeekPosition[] => rawZonesSeekChangedMessage;

export { transformToZoneSeekPositions };
