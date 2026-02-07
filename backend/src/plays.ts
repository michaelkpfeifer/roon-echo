import { exit } from 'node:process';

import type { Knex } from 'knex';

import { findRoonTrackByNameAndAlbumName } from './repository.js';
import type { RoonExtendedTrack } from '../../shared/internal/roonExtendedTrack';
import type { DatabaseSchema } from '../databaseSchema';

const getSeekPosition = (zoneId, zonesSeekChangedMessage) => {
  const zoneData = zonesSeekChangedMessage.find(
    (currentZoneData) => currentZoneData.zoneId === zoneId,
  );

  if (!zoneData) {
    return null;
  }

  return zoneData.seekPosition;
};

const getQueueItemId = (zoneId, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].queueItemId || null;
};

const getRoonAlbumName = (zoneId, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].threeLine.line3;
};

const getRoonTrackName = (zoneId, playingQueueItems) => {
  if (!playingQueueItems[zoneId]) {
    return null;
  }

  return playingQueueItems[zoneId].threeLine.line1;
};

const getRoonExtendedTrack = async (
  db,
  roonAlbumName,
  roonTrackName,
): RoonExtendedTrack => {
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
  console.log(
    'DEV: plays.ts: updatePlays(): zonePlayingStates:',
    zonePlayingStates,
  );
  console.log(
    'DEV: plays.ts: updatePlays(): zonesSeekChangedMessage:',
    zonesSeekChangedMessage,
  );
  console.log(
    'DEV: plays.ts: updatePlays(): playingQueueItems:',
    playingQueueItems,
  );

  const newZonePlayingStates = await Promise.all(
    zonePlayingStates.map(async (zonePlayingState) => {
      const {
        zoneId,
        previousQueueItemId,
        previousPlayedSegments,
        previousPlayId,
      } = zonePlayingState;

      const seekPosition = getSeekPosition(zoneId, zonesSeekChangedMessage);
      const queueItemId = getQueueItemId(zoneId, playingQueueItems);
      const roonAlbumName = getRoonAlbumName(zoneId, playingQueueItems);
      const roonTrackName = getRoonTrackName(zoneId, playingQueueItems);

      if (
        seekPosition === null ||
        queueItemId === null ||
        roonAlbumName === null ||
        roonTrackName === null
      ) {
        return zonePlayingState;
      }

      const roonExtendedTrack = getRoonExtendedTrack(
        db,
        roonAlbumName,
        roonTrackName,
      );

      if (roonExtendedTrack === null) {
        return zonePlayingState;
      }

      return zonePlayingState;
    }),
  );

  console.log(
    'DEV: plays.ts, updatePlays(): newZonePlayingStates:',
    newZonePlayingStates,
  );

  return newZonePlayingStates;
};

export { updatePlays };
