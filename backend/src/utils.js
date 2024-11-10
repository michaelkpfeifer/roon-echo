import fp from 'lodash/fp.js';

function camelCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  } else if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.camelCase,
      fp.mapValues((value) => camelCaseKeys(value))(obj),
    );
  } else {
    return obj;
  }
}

function snakeCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys);
  } else if (fp.isPlainObject(obj)) {
    return fp.mapKeys(
      fp.snakeCase,
      fp.mapValues((value) => snakeCaseKeys(value))(obj),
    );
  } else {
    return obj;
  }
}

const extractZoneData = (zoneData) => {
  return {
    zoneId: zoneData.zoneId,
    displayName: zoneData.displayName,
    state: zoneData.state,
    queueTimeRemaining: zoneData.queueTimeRemaining,
    nowPlaying: zoneData.nowPlaying ? zoneData.nowPlaying : null,
  };
};

const buildFrontendRoonState = (zonesMsg) => {
  // console.log(
  //   'utils.js: buildFrontendRoonState(): zonesMsg:',
  //   JSON.stringify(zonesMsg, null, 4),
  // );

  return {
    zones: Object.fromEntries(
      zonesMsg.map((zoneData) => {
        return [zoneData.zoneId, extractZoneData(zoneData)];
      }),
    ),
  };
};

export { buildFrontendRoonState, camelCaseKeys, snakeCaseKeys };
