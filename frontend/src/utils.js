const findSelectedZone = (roonZones, selectedZoneId) => {
  if (selectedZoneId === null) {
    return null;
  }

  return roonZones[selectedZoneId] || null;
};

const setAlbums = (currentAppState, albums) => ({
  ...currentAppState,
  albums,
});

const setLoadData = (currentAppState, loadData) => ({
  ...currentAppState,
  loadData,
});

export { findSelectedZone, setAlbums, setLoadData };
