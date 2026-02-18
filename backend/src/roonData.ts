import type { Knex } from 'knex';
import fp from 'lodash/fp.js';
import type { Result } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import {
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
  buildEmptyAlbumAggregate,
} from './factories/albumAggregateFactory.js';
import {
  fetchRoonAlbum,
  fetchRoonTracks,
  insertRoonAlbum,
  insertRoonTracks,
} from './repository.js';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse.js';
import type { RawRoonAlbum } from '../../shared/external/rawRoonAlbum.js';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate.js';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum.js';
import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { RawRoonLoadAlbumResponseSchema } from './schemas/rawRoonLoadAlbumResponse.js';
import { transformToRoonAlbum } from './transforms/roonAlbum.js';
import { transformToRoonTrack } from './transforms/roonAlbum.js';
import { camelCaseKeys } from './utils.js';
import type { RawRoonTrack } from '../../shared/external/rawRoonTrack.js';

const createAlbumAggregateWithRoonAlbum = (roonAlbum: RoonAlbum) => {
  const albumAggregateWithRoonAlbum = buildAlbumAggregateWithRoonAlbum(
    buildEmptyAlbumAggregate(),
    roonAlbum,
  );

  return albumAggregateWithRoonAlbum;
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

const mergePersistedRoonAlbum = (
  rawRoonAlbum: RawRoonAlbum,
  persistedRoonAlbumResult: Result<
    PersistedRoonAlbum,
    {
      error: string;
      roonAlbumName: string;
      roonAlbumArtistName: string;
    }
  >,
): RoonAlbum => {
  const roonAlbumAttributes = persistedRoonAlbumResult.isErr()
    ? {
        albumId: uuidv7(),
        mbCandidatesFetchedAt: null,
        mbCandidatesMatchedAt: null,
      }
    : fp.pick(
        ['albumId', 'mbCandidatesFetchedAt', 'mbCandidatesMatchedAt'],
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

  const rawRoonTracks: RawRoonTrack[] = rawRoonLoadAlbumResponse.items;

  const roonTracks: RoonTrack[] = rawRoonTracks.map((rawRoonTrack, index) => {
    const roonTrackId = uuidv7();

    return transformToRoonTrack(
      rawRoonTrack,
      roonAlbum.albumId,
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
  const roonAlbums = await getRoonAlbums(db, browseInstance);

  const albumAggregatesWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >[] = roonAlbums.map((roonAlbum) =>
    createAlbumAggregateWithRoonAlbum(roonAlbum),
  );

  /* eslint-disable no-console */
  console.log(
    'albumAggregatesWithRoonAlbum:',
    JSON.stringify(albumAggregatesWithRoonAlbum, null, 4),
  );
  /* eslint-enable no-console */

  const albumAggregatesWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >[] = [];

  for (const albumAggregateWithRoonAlbum of albumAggregatesWithRoonAlbum) {
    const roonTracks: RoonTrack[] = await getRoonTracks(
      db,
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
    'albumAggregatesWithRoonTracks:',
    JSON.stringify(albumAggregatesWithRoonTracks, null, 4),
  );
  /* eslint-enable no-console */

  return albumAggregatesWithRoonTracks;
};

export {
  createAlbumAggregateWithRoonAlbum,
  createAlbumAggregateWithRoonTracks,
  getRoonAlbums,
  getRoonTracks,
  initializeRoonData,
  mergePersistedRoonAlbum,
};
