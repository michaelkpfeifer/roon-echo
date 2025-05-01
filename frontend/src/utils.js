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

const setAlbumsV2 = (currentAppState, albums) => ({
  ...currentAppState,
  albumsV2: albums,
});

const mergeAlbum = (currentAppState, album) => ({
  ...currentAppState,
  albumsV2: currentAppState.albumsV2.map((currentAlbum) =>
    currentAlbum.id === album.id ? album : currentAlbum,
  ),
});

const setBrowseData = (currentAppState, browseData) => ({
  ...currentAppState,
  browseData,
});

const formatMbTrackLength = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export {
  findSelectedZone,
  formatMbTrackLength,
  mergeAlbum,
  setAlbums,
  setAlbumsV2,
  setBrowseData,
};
