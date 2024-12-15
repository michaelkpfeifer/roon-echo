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

const setAlbums = (currentAppState, albums) => ({
  ...currentAppState,
  albums,
});

const setTracks = (currentAppState, tracks) => ({
  ...currentAppState,
  tracks,
});

export { findSelectedZone, setAlbums, setSelectedScreen, setTracks };
