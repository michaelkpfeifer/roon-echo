const findSelectedZone = (roonZones, selectedZoneId) => {
  if (selectedZoneId === null) {
    return null;
  }

  return roonZones[selectedZoneId] || null;
};

/* eslint-disable import/prefer-default-export */
export { findSelectedZone };
/* eslint-enable import/prefer-default-export */
