import type { AppState } from './internal/appState';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { RoonQueueItem } from '../../shared/internal/roonQueueItem';
import type { Zone } from '../../shared/internal/zone';

const findSelectedZone = (
  roonZones: Record<string, Zone>,
  selectedZoneId: string | null,
) => {
  if (selectedZoneId === null) {
    return null;
  }

  return roonZones[selectedZoneId] || null;
};

const lookupZoneName = (roonZones: Record<string, Zone>, zoneId: string) =>
  roonZones[zoneId].displayName || '-';

const mergeAlbumAggregate = (
  currentAlbumAggregates: AlbumAggregate[],
  albumAggregate: AlbumAggregate,
) => {
  if (
    albumAggregate.stage === 'empty' ||
    albumAggregate.stage === 'withRoonAlbum'
  ) {
    throw new Error(
      `Error: Unexpected albumAggregate stage: ${albumAggregate.stage}`,
    );
  }

  return currentAlbumAggregates.map((currentAlbumAggregate) => {
    if (
      currentAlbumAggregate.stage === 'empty' ||
      currentAlbumAggregate.stage === 'withRoonAlbum'
    ) {
      throw new Error(
        `Error: Unexpected albumAggregate stage: ${currentAlbumAggregate.stage}`,
      );
    }

    return currentAlbumAggregate.id === albumAggregate.id
      ? albumAggregate
      : currentAlbumAggregate;
  });
};

const mergeQueues = (
  currentAppState: AppState,
  zoneId: string,
  queueItems: RoonQueueItem[],
): AppState => {
  return {
    ...currentAppState,
    queues: { ...currentAppState.queues, [zoneId]: queueItems },
  };
};

const formatMbTrackLength = (durationInMilliseconds: number) => {
  const totalSeconds = Math.floor(durationInMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatRoonTrackLength = (durationInSeconds: number | null) => {
  if (durationInSeconds === null) {
    return '-';
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export {
  findSelectedZone,
  formatMbTrackLength,
  formatRoonTrackLength,
  lookupZoneName,
  mergeAlbumAggregate,
  mergeQueues,
};
