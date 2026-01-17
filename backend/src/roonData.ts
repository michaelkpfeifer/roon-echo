import fp from 'lodash/fp.js';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import { fetchRoonAlbum, insertRoonAlbum } from './repository';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import { camelCaseKeys } from './utils.js';
import { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';
import { AlbumAggregate } from '../../shared/internal/albumAggregate';
import { db } from '../db.js';
import { transformToRoonAlbum } from './transforms/roonAlbum';
import { RoonAlbum } from '../../shared/internal/roonAlbum';

const getRoonAlbums = async (browseInstance: RoonApiBrowse) => {
  const response = camelCaseKeys(await browser.loadAlbums(browseInstance));
  const validatedResponse = RawRoonLoadAlbumsResponseSchema.parse(response);

  const rawRoonAlbums: RawRoonAlbum[] = validatedResponse.items;

  const roonAlbums: RoonAlbum[] = [];
  for (const rawRoonAlbum of rawRoonAlbums) {
    const roonAlbumResult = await fetchRoonAlbum(db, rawRoonAlbum);

    const persistedAttributes = roonAlbumResult.isErr()
      ? {
          roonAlbumId: uuidv7(),
          candidatesFetchedAt: null,
          candidatesMatchedAt: null,
        }
      : fp.pick(
          ['roonAlbumId', 'candidatesFetchedAt', 'candidatesMatchedAt'],
          roonAlbumResult._unsafeUnwrap(),
        );

    const roonAlbum = transformToRoonAlbum(rawRoonAlbum, persistedAttributes);

    if (roonAlbumResult.isErr()) {
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
