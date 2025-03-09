import Fuse from 'fuse.js';

const appendToScheduledTracks = ({
  scheduledTracks,
  mbTrackData,
  scheduledAt,
  zoneId,
}) => {
  const scheduledTrack = {
    ...mbTrackData,
    mbLength: Math.floor(mbTrackData.mbLength / 1000),
    scheduledAt,
    zoneId,
    queueItemId: null,
  };

  return [...scheduledTracks, scheduledTrack];
};

const fuzzySearchOptions = {
  keys: [
    { name: 'mbTrackName', weight: 1.0 },
    { name: 'mbAlbumName', weight: 0.5 },
    { name: 'mbArtistNames', weight: 0.1 },
  ],
  threshold: 0.75,
  isCaseSensitive: true,
  ignoreDiacritics: true,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true,
  ignoreLocation: true,
  matchAllTokens: false,
};

const fuzzySearchInScheduledTracks = ({
  scheduledTracks,
  zoneId,
  nowPlaying,
}) => {
  const fuse = new Fuse(
    scheduledTracks.filter(
      (scheduledTrack) => scheduledTrack.zoneId === zoneId,
    ),
    fuzzySearchOptions,
  );
  const results = fuse.search(nowPlaying);

  return results.length ? results[0].item : null;
};

const setQueueItemIdsInScheduledTracks = ({
  scheduledTracks,
  zoneId,
  queueItems,
}) => {
  /* eslint-disable no-console */
  // console.log(
  //   'playCount.js, setQueueItemIdsInScheduledTracks(), scheduledTracks:',
  //   scheduledTracks,
  // );
  // console.log(
  //   'playCount.js, setQueueItemIdsInScheduledTracks(), zoneId:',
  //   zoneId,
  // );
  // console.log(
  //   'playCount.js, setQueueItemIdsInScheduledTracks(), queueItems:',
  //   JSON.stringify(queueItems, null, 4),
  // );
  /* eslint-enable no-console */

  const matchedQueueItemIds = scheduledTracks
    .filter((scheduledTrack) => scheduledTrack.queueItemId !== null)
    .map((scheduledTrack) => scheduledTrack.queueItemId);
  const unmatchedQueueItems = queueItems.filter(
    (item) => !matchedQueueItemIds.includes(item),
  );

  const combiningFunction = (currentScheduledTracks, unmatchedQueueItem) => {
    const nowPlaying = {
      mbTrackName: unmatchedQueueItem.threeLine.line1,
      mbAlbumName: unmatchedQueueItem.threeLine.line3,
      mbArtistNames: unmatchedQueueItem.threeLine.line2,
    };

    const fuzzySearchResult = fuzzySearchInScheduledTracks({
      scheduledTracks: currentScheduledTracks,
      zoneId,
      nowPlaying,
    });

    if (!fuzzySearchResult) {
      return currentScheduledTracks;
    }

    /* eslint-disable no-console */
    // console.log('fuzzySearchResult.mbTrackId', fuzzySearchResult.mbTrackId);
    /* eslint-enable no-console */

    return currentScheduledTracks.map((currentScheduledTrack) => {
      if (currentScheduledTrack.queueItemId) {
        return currentScheduledTrack;
      }

      if (currentScheduledTrack.mbTrackId === fuzzySearchResult.mbTrackId) {
        return {
          ...currentScheduledTrack,
          queueItemId: unmatchedQueueItem.queueItemId,
        };
      }

      return currentScheduledTrack;
    });
  };

  return unmatchedQueueItems.reduce(
    (currentScheduledTracks, unmatchedQueueItem) =>
      combiningFunction(currentScheduledTracks, unmatchedQueueItem),
    scheduledTracks,
  );
};

export {
  appendToScheduledTracks,
  fuzzySearchInScheduledTracks,
  setQueueItemIdsInScheduledTracks,
};
