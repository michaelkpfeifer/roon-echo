import type { Knex } from 'knex';
import fp from 'lodash/fp.js';
import { Result } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import { fetchRoonAlbum, insertRoonAlbum } from './repository';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import { transformToRoonAlbum } from './transforms/roonAlbum';
import { camelCaseKeys } from './utils.js';
import { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';
import { AlbumAggregate } from '../../shared/internal/albumAggregate';
import { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum';
import { RoonAlbum } from '../../shared/internal/roonAlbum';
import type { DatabaseSchema } from '../databaseSchema';

const mergePersistedRoonAlbum = (
  rawRoonAlbum: RawRoonAlbum,
  persistedRoonAlbumResult: Result<
    PersistedRoonAlbum,
    {
      error: string;
      albumName: string;
      artistName: string;
    }
  >,
): RoonAlbum => {
  const roonAlbumAttributes = persistedRoonAlbumResult.isErr()
    ? {
        roonAlbumId: uuidv7(),
        candidatesFetchedAt: null,
        candidatesMatchedAt: null,
      }
    : fp.pick(
        ['roonAlbumId', 'candidatesFetchedAt', 'candidatesMatchedAt'],
        persistedRoonAlbumResult._unsafeUnwrap(),
      );

  return transformToRoonAlbum(rawRoonAlbum, roonAlbumAttributes);
};

const getRoonAlbums = async (
  db: Knex<DatabaseSchema>,
  browseInstance: RoonApiBrowse,
) => {
  const response = camelCaseKeys(await browser.loadAlbums(browseInstance));
  const validatedResponse = RawRoonLoadAlbumsResponseSchema.parse(response);

  const rawRoonAlbums: RawRoonAlbum[] = validatedResponse.items;

  const roonAlbums: RoonAlbum[] = [];

  for (const rawRoonAlbum of rawRoonAlbums) {
    const persistedRoonAlbumResult = await fetchRoonAlbum(db, rawRoonAlbum);
    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      persistedRoonAlbumResult,
    );

    if (persistedRoonAlbumResult.isErr()) {
      await insertRoonAlbum(db, roonAlbum);
    }

    roonAlbums.push(roonAlbum);
  }

  return roonAlbums;
};

const initializeRoonData = async (
  db: Knex<DatabaseSchema>,
  browseInstance: RoonApiBrowse,
) => {
  const albumAggregates: (
    | Extract<AlbumAggregate, { state: 'withRoonAlbum' }>[]
    | Extract<AlbumAggregate, { state: 'withRoonTracks' }>
  )[] = [];

  const roonAlbums = await getRoonAlbums(db, browseInstance);

  return roonAlbums;

  // return albumAggregates;
};

export { getRoonAlbums, initializeRoonData, mergePersistedRoonAlbum };
