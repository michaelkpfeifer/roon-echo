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

const findMatch = (history, nowPlaying) => {
  const options = {
    keys: ['mbTrackName', 'mbAlbumName', 'mbArtistNames'],
    threshold: 0.5,
    ignoreLocation: true,
    findAllMatches: true,
    shouldSort: true,
    tokenize: true,
    matchAllTokens: false,
    includeScore: true,
  };

  const fuse = new Fuse(history, options);
  const results = fuse.search(nowPlaying);

  return results.length ? results[0].item : null;
};

export { appendToScheduledTracks, findMatch };
