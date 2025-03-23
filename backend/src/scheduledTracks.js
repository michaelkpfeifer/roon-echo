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
    playedSegments: [],
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
  /* eslint-disable no-console */
  // console.log(
  //   'scheduledTracks.js, fuzzySearchInScheduledTracks(): scheduledTracks:',
  //   scheduledTracks,
  // );
  // console.log(
  //   'scheduledTracks.js, fuzzySearchInScheduledTracks(): zoneId:',
  //   zoneId,
  // );
  // console.log(
  //   'scheduledTracks.js, fuzzySearchInScheduledTracks(): nowPlaying:',
  //   nowPlaying,
  // );
  /* eslint-enable no-console */

  const fuse = new Fuse(
    scheduledTracks.filter(
      (scheduledTrack) => scheduledTrack.zoneId === zoneId,
    ),
    fuzzySearchOptions,
  );
  const results = fuse.search(nowPlaying);

  /* eslint-disable no-console */
  // console.log(
  //   'scheduledTracks.js: fuzzySearchInScheduledTracks(): results:',
  //   results,
  // );
  /* eslint-enable no-console */

  return results.length ? results[0].item : null;
};

const setQueueItemIdsInScheduledTracks = ({
  scheduledTracks,
  zoneId,
  queueItems,
}) => {
  /* eslint-disable no-console */
  // console.log(
  //   'scheduledTracks.js, setQueueItemIdsInScheduledTracks(), scheduledTracks:',
  //   scheduledTracks,
  // );
  // console.log(
  //   'scheduledTracks.js, setQueueItemIdsInScheduledTracks(), zoneId:',
  //   zoneId,
  // );
  // console.log(
  //   'scheduledTracks.js, setQueueItemIdsInScheduledTracks(), queueItems:',
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

const mergePlayedSegments = (playedSegments) => {
  const sorted = playedSegments.sort((s1, s2) => s1[0] - s2[0]);

  return sorted.reduce((acc, currentSegment) => {
    if (acc.length === 0) {
      acc.push(currentSegment);
      return acc;
    }

    const lastSegment = acc[acc.length - 1];
    if (lastSegment[1] === currentSegment[0]) {
      acc[acc.length - 1] = [lastSegment[0], currentSegment[1]];
      return acc;
    }

    acc.push(currentSegment);
    return acc;
  }, []);
};

const applySeekPositionToPlayedSegments = (seekPosition, playedSegments) => {
  if (playedSegments.length === 0) {
    return [[seekPosition, seekPosition]];
  }

  const seekPositionExtendsPlayedSegment = playedSegments.some(
    ([, end]) => end + 1 === seekPosition,
  );

  if (seekPositionExtendsPlayedSegment) {
    return mergePlayedSegments(
      playedSegments.map(([start, end]) => {
        if (end + 1 === seekPosition) {
          return [start, seekPosition];
        }
        return [start, end];
      }),
    );
  }

  const seekPositionIncludedInPlayedSegments = playedSegments.some(
    ([start, end]) => start <= seekPosition && seekPosition <= end,
  );

  if (seekPositionIncludedInPlayedSegments) {
    return playedSegments;
  }

  return [...playedSegments, [seekPosition, seekPosition]];
};

const getPlayedTime = (playedSegments) => {};

const isPlayed = (playedSegments, trackLength) => {};

const buildPlayingTrack = (queueItem) => ({
  queueItemId: queueItem.queueItemId,
  length: queueItem.length,
  imageKey: queueItem.imageKey,
  nowPlaying: {
    roonArtistName: queueItem.threeLine.line2,
    roonAlbumName: queueItem.threeLine.line3,
    roonTrackName: queueItem.threeLine.line1,
  },
});

const setPlayingTracks = ({ zoneId, queueItems, playingTracks }) => {
  /* eslint-disable no-console */
  // console.log(
  //   'scheduledTracks.js: setPlayingTracks(): queueItems:',
  //   queueItems,
  // );
  // console.log(
  //   'scheduledTracks.js: setPlayingTracks(): playingTracks:',
  //   playingTracks,
  // );
  /* eslint-enable no-console */

  if (queueItems.length === 0) {
    return { ...playingTracks, [zoneId]: null };
  }

  return {
    ...playingTracks,
    [zoneId]: buildPlayingTrack(queueItems[0]),
  };
};

const updatePlayedSegmentsInScheduledTracks = ({
  zonesSeekChangedMessage,
  scheduledTracks,
  playingTracks,
}) => {
  /* eslint-disable no-console */
  // console.log(
  //   'scheduledTracks.js, updatePlayedSegmentsInScheduledTracks(), zonesSeekChangedMessage:',
  //   zonesSeekChangedMessage,
  // );
  // console.log(
  //   'scheduledTracks.js, updatePlayedSegmentsInScheduledTracks(), scheduledTracks:',
  //   JSON.stringify(scheduledTracks, null, 4),
  // );
  // console.log(
  //   'scheduledTracks.js, updatePlayedSegmentsInScheduledTracks(), playingTracks:',
  //   playingTracks,
  // );
  /* eslint-enable no-console */

  return zonesSeekChangedMessage.reduce(
    (newScheduledTracks, { zoneId, seekPosition }) => {
      const playingTrack = playingTracks[zoneId];
      if (playingTrack) {
        const { queueItemId } = playingTrack;

        return scheduledTracks.map((scheduledTrack) => {
          if (
            scheduledTrack.queueItemId === queueItemId &&
            scheduledTrack.zoneId === zoneId
          ) {
            return {
              ...scheduledTrack,
              playedSegments: applySeekPositionToPlayedSegments(
                seekPosition,
                scheduledTrack.playedSegments,
              ),
            };
          }

          return scheduledTrack;
        });
      }

      return newScheduledTracks;
    },
    scheduledTracks,
  );
};

export {
  appendToScheduledTracks,
  applySeekPositionToPlayedSegments,
  fuzzySearchInScheduledTracks,
  mergePlayedSegments,
  setPlayingTracks,
  setQueueItemIdsInScheduledTracks,
  updatePlayedSegmentsInScheduledTracks,
};
