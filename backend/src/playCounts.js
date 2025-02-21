import Fuse from 'fuse.js';

const appendToScheduledTracks = (
  scheduledTracks,
  mbTrackData,
  scheduledAt,
  zoneId,
) => {
  const scheduledTrack = { ...mbTrackData, scheduledAt, zoneId };

  return [...scheduledTracks, scheduledTrack];
};

const findMatch = (history, zoneId, nowPlaying) => {
  const options = {
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

  const fuse = new Fuse(
    history.filter((scheduledTrack) => scheduledTrack.zoneId === zoneId),
    options,
  );
  const results = fuse.search(nowPlaying);

  return results.length ? results[0].item : null;
};

export { appendToScheduledTracks, findMatch };
