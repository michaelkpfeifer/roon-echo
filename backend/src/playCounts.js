import Fuse from 'fuse.js';

const appendToScheduledTracks = ({
  scheduledTracks,
  mbTrackData,
  uuid,
  scheduledAt,
  zoneId,
}) => {
  const scheduledTrack = {
    ...mbTrackData,
    mbLength: Math.floor(mbTrackData.mbLength / 1000),
    uuid,
    scheduledAt,
    zoneId,
  };

  return [...scheduledTracks, scheduledTrack];
};

const fuzzySearchOptions = {
  keys: [
    { name: 'mbTrackName', weight: 0.25 },
    { name: 'mbAlbumName', weight: 0.5 },
    { name: 'mbArtistNames', weight: 1.0 },
  ],
  threshold: 0.5,
  ignoreLocation: true,
  findAllMatches: true,
  shouldSort: true,
  tokenize: true,
  matchAllTokens: false,
  includeScore: true,
};

const fuzzySearchInScheduledTracks = (scheduledTracks, zoneId, nowPlaying) => {
  const fuse = new Fuse(
    scheduledTracks.filter(
      (scheduledTrack) => scheduledTrack.zoneId === zoneId,
    ),
    fuzzySearchOptions,
  );
  const results = fuse.search(nowPlaying);

  return results.length ? results[0].item : null;
};

const findMatchInScheduledTracks = (
  scheduledTracks,
  playingTracks,
  zoneId,
  { roonTrackName, roonAlbumName, roonArtistNames },
) => {
  const nowPlaying = {
    mbTrackName: roonTrackName,
    mbAlbumName: roonAlbumName,
    mbArtistNames: roonArtistNames,
  };

  const fuzzySearchResults = fuzzySearchInScheduledTracks(
    scheduledTracks,
    zoneId,
    nowPlaying,
  );

  if (!fuzzySearchResults) {
    return [scheduledTracks, playingTracks];
  }

  return [
    scheduledTracks.filter(
      (scheduledTrack) => scheduledTrack.uuid !== fuzzySearchResults.uuid,
    ),
    [...playingTracks, fuzzySearchResults],
  ];
};

export {
  appendToScheduledTracks,
  findMatchInScheduledTracks,
  fuzzySearchInScheduledTracks,
};
