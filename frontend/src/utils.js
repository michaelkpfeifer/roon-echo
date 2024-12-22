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

const setAlbum = (currentAppState, album) => ({
  ...currentAppState,
  album,
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
  setAlbum,
  setArtists,
  setSelectedScreen,
  setTracks,
};
