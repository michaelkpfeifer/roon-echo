import type { Knex } from 'knex';
import fp from 'lodash/fp.js';
import type { Result } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import {
  buildAlbumAggregateWithRoonAlbum,
  buildEmptyAlbumAggregate,
} from './factories/albumAggregateFactory';
import {
  fetchRoonAlbum,
  fetchRoonTracks,
  insertRoonAlbum,
  insertRoonTracks,
} from './repository';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import type { RawRoonAlbum } from '../../shared/external/rawRoonAlbum';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum';
import type { RoonAlbum } from '../../shared/internal/roonAlbum';
import type { RoonTrack } from '../../shared/internal/roonTrack';
import type { DatabaseSchema } from '../databaseSchema';
import { RawRoonLoadAlbumResponseSchema } from './schemas/rawRoonLoadAlbumResponse';
import { RawRoonTrackSchema } from './schemas/rawRoonTrack';
import { transformToRoonAlbum } from './transforms/roonAlbum';
import { transformToRoonTrack } from './transforms/roonAlbum';
import { camelCaseKeys } from './utils.js';
import type { RawRoonTrack } from '../../shared/external/rawRoonTrack';

const createAlbumAggregateWithRoonAlbum = (roonAlbum: RoonAlbum) => {
  const albumAggregateWithRoonAlbum = buildAlbumAggregateWithRoonAlbum(
    buildEmptyAlbumAggregate(),
    roonAlbum,
  );

  return albumAggregateWithRoonAlbum;
};

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

const getRoonTracks = async (
  db: Knex<DatabaseSchema>,
  browseInstance: RoonApiBrowse,
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
) => {
  const roonAlbum = albumAggregateWithRoonAlbum.roonAlbum;
  const persistedRoonTracks: RoonTrack[] = await fetchRoonTracks(db, roonAlbum);

  if (persistedRoonTracks.length > 0) {
    return persistedRoonTracks;
  }

  const response: unknown = camelCaseKeys(
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

  return await fetchRoonTracks(db, roonAlbum);
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

export {
  createAlbumAggregateWithRoonAlbum,
  getRoonAlbums,
  getRoonTracks,
  initializeRoonData,
  mergePersistedRoonAlbum,
};
