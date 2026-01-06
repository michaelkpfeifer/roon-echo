const findSelectedZone = (roonZones, selectedZoneId) => {
  if (selectedZoneId === null) {
    return null;
  }

  return roonZones[selectedZoneId] || null;
};

const lookupZoneName = (roonZones, zoneId) =>
  roonZones[zoneId].displayName || '-';

const setAlbums = (currentAppState, albums) => ({
  ...currentAppState,
  albums,
});

const mergeAlbum = (currentAppState, album) => ({
  ...currentAppState,
  albums: currentAppState.albums.map((currentAlbum) =>
    currentAlbum.id === album.id ? album : currentAlbum,
  ),
});

const mergeQueues = (currentAppState, zoneId, queueItems) => {
  return {
    ...currentAppState,
    queues: { ...currentAppState.queues, [zoneId]: queueItems },
  };
};

const formatMbTrackLength = (durationInMilliseconds) => {
  const totalSeconds = Math.floor(durationInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatRoonTrackLength = (durationInSeconds) => {
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export {
  findSelectedZone,
  formatMbTrackLength,
  formatRoonTrackLength,
  lookupZoneName,
  mergeAlbum,
  mergeQueues,
  setAlbums,
};
