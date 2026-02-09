import { exit } from 'node:process';

import type { Knex } from 'knex';
import fp from 'lodash/fp.js';
import { v7 as uuidv7 } from 'uuid';

import { findRoonTrackByNameAndAlbumName, upsertPlay } from './repository.js';
import type { Play } from '../../shared/internal/play';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack';
import type { DatabaseSchema } from '../databaseSchema';
import {
  applySeekPositionToPlayedSegments,
  getPlayedTime,
} from './scheduledTracks';
import { toIso8601 } from './utils';

const buildPlay = (
  id: string,
  roonExtendedTrack: RoonExtendedTrack,
  trackLength: number,
  playedSegments: number[][],
): Play => {
  const playedTime = getPlayedTime(playedSegments);

  return fp.omit(['trackName'], {
    ...roonExtendedTrack,
    roonTrackName: roonExtendedTrack.trackName,
    id,
    playedAt: toIso8601(new Date()),
    fractionPlayed: playedTime / trackLength,
    isPlayed: 2 * playedTime >= trackLength,
  });
};

const getSeekPosition = (zoneId: string, zonesSeekChangedMessage) => {
  const zoneData = zonesSeekChangedMessage.find(
    (currentZoneData) => currentZoneData.zoneId === zoneId,
  );

  if (!zoneData) {
    return null;
  }

  return zoneData.seekPosition;
};

const getQueueItemId = (zoneId: string, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].queueItemId || null;
};

const getTrackLength = (zoneId: string, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].length;
};

const getRoonAlbumName = (zoneId: string, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].threeLine.line3;
};

const getRoonTrackName = (zoneId: string, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].threeLine.line1;
};

const getRoonExtendedTrack = async (
  db: Knex<DatabaseSchema>,
  roonAlbumName: string,
  roonTrackName: string,
): Promise<RoonExtendedTrack | null> => {
  const persistedTrackswithAlbums = await findRoonTrackByNameAndAlbumName(
    db,
    roonAlbumName,
    roonTrackName,
  );

  if (persistedTrackswithAlbums.length > 1) {
    process.stderr.write(
      `Error: Could not uniquely identify persisted playing track: ${roonTrackName}.\n`,
    );
    exit(2);
  }

  if (persistedTrackswithAlbums.length === 0) {
    return null;
  }

  return persistedTrackswithAlbums[0];
};

const updatePlays = async ({
  db,
  zonePlayingStates,
  zonesSeekChangedMessage,
  playingQueueItems,
}: {
  db: Knex<DatabaseSchema>;
}) => {
  const newZonePlayingStates = await Promise.all(
    zonePlayingStates.map(async (zonePlayingState) => {
      const {
        zoneId,
        previousQueueItemId,
        previousPlayedSegments,
        previousPlayId,
      } = zonePlayingState;

      const seekPosition = getSeekPosition(zoneId, zonesSeekChangedMessage);
      const roonAlbumName = getRoonAlbumName(zoneId, playingQueueItems);
      const roonTrackName = getRoonTrackName(zoneId, playingQueueItems);

      if (
        seekPosition === null ||
        roonAlbumName === null ||
        roonTrackName === null
      ) {
        return zonePlayingState;
      }

      const roonExtendedTrack = await getRoonExtendedTrack(
        db,
        roonAlbumName,
        roonTrackName,
      );

      if (roonExtendedTrack === null) {
        return zonePlayingState;
      }

      const queueItemId = getQueueItemId(zoneId, playingQueueItems);
      const trackLength = getTrackLength(zoneId, playingQueueItems);

      if (!queueItemId) {
        return zonePlayingState;
      }

      if (queueItemId === previousQueueItemId) {
        const newPlayedSegments = applySeekPositionToPlayedSegments(
          seekPosition,
          previousPlayedSegments,
        );

        const play = buildPlay(
          previousPlayId,
          roonExtendedTrack,
          trackLength,
          newPlayedSegments,
        );

        upsertPlay(db, play);

        return {
          ...zonePlayingState,
          previousPlayedSegments: newPlayedSegments,
        };
      } else {
        const newPlayedSegments = applySeekPositionToPlayedSegments(
          seekPosition,
          [],
        );

        const newPlayId = uuidv7();
        const play = buildPlay(
          newPlayId,
          roonExtendedTrack,
          trackLength,
          newPlayedSegments,
        );

        upsertPlay(db, play);

        return {
          ...zonePlayingState,
          previousQueueItemId: queueItemId,
          previousPlayedSegments: newPlayedSegments,
          previousPlayId: newPlayId,
        };
      }
    }),
  );

  return newZonePlayingStates;
};

export { updatePlays };
