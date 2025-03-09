const extractZoneData = (zoneData) => ({
  zoneId: zoneData.zoneId,
  displayName: zoneData.displayName,
  state: zoneData.state,
  queueTimeRemaining: zoneData.queueTimeRemaining,
  nowPlaying: zoneData.nowPlaying ? zoneData.nowPlaying : null,
});

const frontendZonesChangedMessage = (zonesChangedMessage) => ({
  zones: Object.fromEntries(
    zonesChangedMessage.map((zoneData) => [
      zoneData.zoneId,
      extractZoneData(zoneData),
    ]),
  ),
});

const frontendZonesSeekChangedMessage = (zonesSeekChangedMessage) =>
  Object.fromEntries(
    zonesSeekChangedMessage.map((zoneData) => [
      zoneData.zoneId,
      {
        seekPosition: zoneData.seekPosition,
        queueTimeRemaining: zoneData.queueTimeRemaining,
        zoneId: zoneData.zoneId,
      },
    ]),
  );

export { frontendZonesChangedMessage, frontendZonesSeekChangedMessage };
