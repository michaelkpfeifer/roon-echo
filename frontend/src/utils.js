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

const formatMbTrackLength = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export { findSelectedZone, formatMbTrackLength, setAlbums, setLoadData };
