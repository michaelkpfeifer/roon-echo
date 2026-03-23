import type { Zone } from '../../shared/internal/zone.js';
import type { ZoneSeekPosition } from '../../shared/internal/zoneSeekPosition.js';

const extractZoneData = (zone: Zone) => ({
  zoneId: zone.zoneId,
  displayName: zone.displayName,
  state: zone.state,
  queueTimeRemaining: zone.queueTimeRemaining,
  nowPlaying: zone.nowPlaying ? zone.nowPlaying : null,
});

const frontendZonesChangedMessage = (zones: Zone[]) => {
  return {
    zones: Object.fromEntries(
      zones.map((zone) => [zone.zoneId, extractZoneData(zone)]),
    ),
  };
};

const frontendZonesSeekChangedMessage = (
  zoneSeekPositions: ZoneSeekPosition[],
) =>
  Object.fromEntries(
    zoneSeekPositions.map((zoneData) => [
      zoneData.zoneId,
      {
        seekPosition: zoneData.seekPosition,
        queueTimeRemaining: zoneData.queueTimeRemaining,
        zoneId: zoneData.zoneId,
      },
    ]),
  );

export { frontendZonesChangedMessage, frontendZonesSeekChangedMessage };
