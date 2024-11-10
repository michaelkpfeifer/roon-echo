import fp from 'lodash/fp.js';

const camelCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  }

  if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.camelCase,
      fp.mapValues((value) => camelCaseKeys(value))(obj),
    );
  }

  return obj;
};

const snakeCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys);
  }

  if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.snakeCase,
      fp.mapValues((value) => snakeCaseKeys(value))(obj),
    );
  }

  return obj;
};

const extractZoneData = (zoneData) => ({
  zoneId: zoneData.zoneId,
  displayName: zoneData.displayName,
  state: zoneData.state,
  queueTimeRemaining: zoneData.queueTimeRemaining,
  nowPlaying: zoneData.nowPlaying ? zoneData.nowPlaying : null,
});

const buildFrontendRoonState = (zonesMsg) => {
  // console.log(
  //   'utils.js: buildFrontendRoonState(): zonesMsg:',
  //   JSON.stringify(zonesMsg, null, 4),
  // );

  return {
    zones: Object.fromEntries(
      zonesMsg.map((zoneData) => [zoneData.zoneId, extractZoneData(zoneData)]),
    ),
  };
};

const buildZonesSeekChangedMessage = (msg) =>
  Object.fromEntries(
    msg.map((zoneData) => [
      zoneData.zoneId,
      {
        seekPosition: zoneData.seekPosition,
        queueTimeRemaining: zoneData.queueTimeRemaining,
        zoneId: zoneData.zoneId,
      },
    ]),
  );

export {
  buildFrontendRoonState,
  buildZonesSeekChangedMessage,
  camelCaseKeys,
  snakeCaseKeys,
};
