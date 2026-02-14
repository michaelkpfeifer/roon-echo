import type { ZoneSeekPosition } from '../../../shared/internal/zoneSeekPosition';
import type { RawZonesSeekChangedMessage } from '../external/rawZonesSeekChangedMessage';

const transformToZoneSeekPositions = (
  rawZonesSeekChangedMessage: RawZonesSeekChangedMessage,
): ZoneSeekPosition[] =>
  rawZonesSeekChangedMessage.map((rawZoneSeekPosition) => ({
    zoneId: rawZoneSeekPosition.zoneId,
    queueTimeRemaining: rawZoneSeekPosition.queueTimeRemaining,
    seekPosition: rawZoneSeekPosition.seekPosition ?? null,
  }));

export { transformToZoneSeekPositions };
