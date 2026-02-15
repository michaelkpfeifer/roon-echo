import type { ZoneSeekPosition } from '../../../shared/internal/zoneSeekPosition.js';
import type { RawZonesSeekChangedMessage } from '../external/rawZonesSeekChangedMessage.js';

const transformToZoneSeekPositions = (
  rawZonesSeekChangedMessage: RawZonesSeekChangedMessage,
): ZoneSeekPosition[] =>
  rawZonesSeekChangedMessage.map((rawZoneSeekPosition) => ({
    zoneId: rawZoneSeekPosition.zoneId,
    queueTimeRemaining: rawZoneSeekPosition.queueTimeRemaining,
    seekPosition: rawZoneSeekPosition.seekPosition ?? null,
  }));

export { transformToZoneSeekPositions };
