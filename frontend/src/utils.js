const findConfiguredZone = (roonZones, configuredZoneId) => {
  if (configuredZoneId === null) {
    return null;
  }

  return roonZones[configuredZoneId] || null;
};

/* eslint-disable import/prefer-default-export */
export { findConfiguredZone };
/* eslint-enable import/prefer-default-export */
