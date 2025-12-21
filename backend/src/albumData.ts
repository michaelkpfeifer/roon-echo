import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { RawRoonLoadAlbumsResponse } from '@shared/external/rawRoonLoadAlbumsResponse';
import { RawRoonTrack } from '@shared/external/rawRoonTrack';
import { AlbumAggregate } from '@shared/internal/albumAggregate';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import { RoonTrack } from '@shared/internal/roonTrack';
import { Socket } from 'socket.io';
import { v7 as uuidv7 } from 'uuid';

import {
  fetchRoonAlbumId,
  fetchRoonTracks,
  insertRoonAlbum,
  insertRoonTracks,
} from './repository';
import { camelCaseKeys } from './utils.js';
import { db } from '../db.js';
import * as browser from './browser.js';
import {
  buildEmptyAlbumAggregate,
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
} from './factories/albumAggregateFactory';
import Result from './result.js';
import { RawRoonLoadAlbumResponseSchema } from './schemas/rawRoonLoadAlbumResponse';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import { RawRoonTrackSchema } from './schemas/rawRoonTrack';
import {
  transformToRoonAlbum,
  transformToRoonTrack,
} from './transforms/roonAlbum';

const isRoonAlbumUnprocessable = (unparsedRawRoonAlbum: unknown) => {
  if (
    !(
      typeof unparsedRawRoonAlbum === 'object' &&
      unparsedRawRoonAlbum !== null &&
      'title' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.title == 'string' &&
      'subtitle' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.subtitle == 'string'
    )
  ) {
    return true;
  }

  return (
    unparsedRawRoonAlbum.title === '' ||
    unparsedRawRoonAlbum.subtitle === 'Unknown Artist'
  );
};

const getRoonAlbums = async (browseInstance: RoonApiBrowse) => {
  const response: any = camelCaseKeys(await browser.loadAlbums(browseInstance));

  const unparsedRawRoonLoadAlbumsResponse: unknown = {
    ...response,
    items: response.items.filter(
      (item: any) => !isRoonAlbumUnprocessable(item),
    ),
  };

  const rawRoonLoadAlbumsResponse: RawRoonLoadAlbumsResponse =
    RawRoonLoadAlbumsResponseSchema.parse(unparsedRawRoonLoadAlbumsResponse);

  const rawRoonAlbums: RawRoonAlbum[] = rawRoonLoadAlbumsResponse.items;

  const roonAlbums: RoonAlbum[] = [];
  for (const rawRoonAlbum of rawRoonAlbums) {
    const roonAlbumIdResult = await fetchRoonAlbumId(db, rawRoonAlbum);

    const roonAlbumId = Result.isErr(roonAlbumIdResult)
      ? uuidv7()
      : Result.unwrap(roonAlbumIdResult);

    const roonAlbum = transformToRoonAlbum(rawRoonAlbum, roonAlbumId);
    if (Result.isErr(roonAlbumIdResult)) {
      await insertRoonAlbum(db, roonAlbum);
    }

    roonAlbums.push(roonAlbum);
  }

  return roonAlbums;
};

const getRoonTracks = async (
  browseInstance: RoonApiBrowse,
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
) => {
  const roonAlbum = albumAggregateWithRoonAlbum.roonAlbum;
  const roonTracksResult = await fetchRoonTracks(db, roonAlbum);

  if (Result.isErr(roonTracksResult)) {
    const response: any = camelCaseKeys(
      await browser.loadAlbum(browseInstance, roonAlbum.itemKey),
    );

    const rawRoonLoadAlbumResponse =
      RawRoonLoadAlbumResponseSchema.parse(response);

    const rawRoonTracks: RawRoonTrack[] = rawRoonLoadAlbumResponse.items.map(
      (unparsedRawRoonTrack: unknown) =>
        RawRoonTrackSchema.parse(unparsedRawRoonTrack),
    );

    const roonTracks: RoonTrack[] = rawRoonTracks.map((rawRoonTrack, index) => {
      const roonTrackId = uuidv7();

      return transformToRoonTrack(
        rawRoonTrack,
        roonAlbum.roonAlbumId,
        roonTrackId,
        index,
      );
    });

    await insertRoonTracks(db, roonTracks);

    return Result.unwrap(await fetchRoonTracks(db, roonAlbum));
  } else {
    return Result.unwrap(roonTracksResult);
  }
};

const createAlbumAggregateWithRoonTracks = (
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
  roonTracks: RoonTrack[],
) => {
  const albumAggregateWithRoonTracks = buildAlbumAggregateWithRoonTracks(
    albumAggregateWithRoonAlbum,
    roonTracks,
  );

  return albumAggregateWithRoonTracks;
};

const createAlbumAggregateWithRoonAlbum = (roonAlbum: RoonAlbum) => {
  const albumAggregateWithRoonAlbum = buildAlbumAggregateWithRoonAlbum(
    buildEmptyAlbumAggregate(),
    roonAlbum,
  );

  return albumAggregateWithRoonAlbum;
};

const buildStableAlbumData = async (
  socket: Socket,
  browseInstance: RoonApiBrowse,
) => {
  const roonAlbums = await getRoonAlbums(browseInstance);

  const albumAggregatesWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >[] = [];
  for (const roonAlbum of roonAlbums) {
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);

    albumAggregatesWithRoonAlbum.push(albumAggregateWithRoonAlbum);
  }

  const albumAggregatesWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >[] = [];
  for (const albumAggregateWithRoonAlbum of albumAggregatesWithRoonAlbum) {
    const roonTracks: RoonTrack[] = await getRoonTracks(
      browseInstance,
      albumAggregateWithRoonAlbum,
    );
    const albumAggregateWithRoonTracks = createAlbumAggregateWithRoonTracks(
      albumAggregateWithRoonAlbum,
      roonTracks,
    );

    albumAggregatesWithRoonTracks.push(albumAggregateWithRoonTracks);
  }

  /* eslint-disable no-console */
  console.log(
    'albumData.ts: buildStableAlbumData(): albumAggregatesWithRoonTracks:',
    JSON.stringify(albumAggregatesWithRoonTracks, null, 4),
  );
  /* eslint-enable no-console */

  socket.emit('albums', albumAggregatesWithRoonTracks);
};

export { buildStableAlbumData, isRoonAlbumUnprocessable };
