const findSelectedZone = (roonZones, selectedZoneId) => {
  if (selectedZoneId === null) {
    return null;
  }

  return roonZones[selectedZoneId] || null;
};

const setSelectedScreen = (currentAppState, selectedScreen) => ({
  ...currentAppState,
  selectedScreen,
});

/* eslint-disable import/prefer-default-export */
export { findSelectedZone, setSelectedScreen };
/* eslint-enable import/prefer-default-export */
