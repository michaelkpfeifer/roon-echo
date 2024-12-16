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

const setArtists = (currentAppState, artists) => ({
  ...currentAppState,
  artists,
});

const setTracks = (currentAppState, tracks) => ({
  ...currentAppState,
  tracks,
});

export {
  findSelectedZone,
  setAlbums,
  setArtists,
  setSelectedScreen,
  setTracks,
};
