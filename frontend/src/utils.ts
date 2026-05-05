import type { AppState } from './internal/appState';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { RoonQueueItem } from '../../shared/internal/roonQueueItem';
import type { Zone } from '../../shared/internal/zone';

const findSelectedZone = (
  zones: Record<string, Zone>,
  selectedZoneId: string | null,
) => {
  if (selectedZoneId === null) {
    return null;
  }

  return zones[selectedZoneId] || null;
};

const lookupZoneName = (zones: Record<string, Zone>, zoneId: string) =>
  zones[zoneId].displayName || '-';

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

const albumsCount = (albumAggregates: AlbumAggregate[]) =>
  albumAggregates.length;

const artistsCount = (albumAggregates: AlbumAggregate[]) =>
  [
    ...new Set(
      albumAggregates
        .filter(
          (albumAggregate) =>
            albumAggregate.stage != 'empty' &&
            albumAggregate.stage != 'withRoonAlbum',
        )
        .map((albumAggregate) => albumAggregate.roonAlbum.roonAlbumArtistName),
    ),
  ].length;

const tracksCount = (albumAggregates: AlbumAggregate[]) =>
  albumAggregates
    .filter(
      (albumAggregate) =>
        albumAggregate.stage != 'empty' &&
        albumAggregate.stage != 'withRoonAlbum',
    )
    .map((albumAggregate) => albumAggregate.roonTracks.length)
    .reduce((acc, n) => acc + n, 0);

export {
  albumsCount,
  artistsCount,
  findSelectedZone,
  formatMbTrackLength,
  formatRoonTrackLength,
  lookupZoneName,
  mergeAlbumAggregate,
  mergeQueues,
  tracksCount,
};
