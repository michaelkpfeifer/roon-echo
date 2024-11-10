const findSelectedZone = (zones, zoneId) => {
  // console.log(
  //   'utils.js: findSelectedZone(): zones.map((z) => z.zoneId):',
  //   zones.map((z) => z.zoneId),
  // );
  // console.log('utils.js: findSelectedZone(): zoneId:', zoneId);

  if (zoneId === null) {
    return null;
  }

  return zones.find((zone) => zone.zoneId === zoneId) || null;
};

export { findSelectedZone };
