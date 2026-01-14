import fp from 'lodash/fp.js';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import { fetchRoonAlbum, insertRoonAlbum } from './repository';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import { camelCaseKeys } from './utils.js';
import { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';
import { AlbumAggregate } from '../../shared/internal/albumAggregate';
import { db } from '../db.js';
import Result from './result.js';
import { transformToRoonAlbum } from './transforms/roonAlbum';
import { RawRoonLoadAlbumsResponse } from '../../shared/external/rawRoonLoadAlbumsResponse';
import { RoonAlbum } from '../../shared/internal/roonAlbum';

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
    const roonAlbumResult = await fetchRoonAlbum(db, rawRoonAlbum);

    const persistedAttributes = Result.isErr(roonAlbumResult)
      ? {
          roonAlbumId: uuidv7(),
          candidatesFetchedAt: null,
          candidatesMatchedAt: null,
        }
      : fp.pick(
          ['roonAlbumId', 'candidatesFetchedAt', 'candidatesMatchedAt'],
          Result.unwrap(roonAlbumResult),
        );

    const roonAlbum = transformToRoonAlbum(rawRoonAlbum, persistedAttributes);

    if (Result.isErr(roonAlbumResult)) {
      await insertRoonAlbum(db, roonAlbum);
    }

    roonAlbums.push(roonAlbum);
  }

  return roonAlbums;
};

const initializeRoonData = async (browseInstance: RoonApiBrowse) => {
  const albumAggregates: (
    | Extract<AlbumAggregate, { state: 'withRoonAlbum' }>[]
    | Extract<AlbumAggregate, { state: 'withRoonTracks' }>
  )[] = [];

  const roonAlbums = await getRoonAlbums(browseInstance);

  return roonAlbums;

  // return albumAggregates;
};

export { getRoonAlbums, initializeRoonData };
