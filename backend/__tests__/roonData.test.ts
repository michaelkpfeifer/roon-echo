import knexInit from 'knex';
import type { Knex } from 'knex';
import { err, ok } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RoonAlbum } from '../../shared/internal/roonAlbum.js';
import {
  buildPersistedRoonAlbum,
  createPersistedRoonAlbum,
} from '../__factories__/persistedRoonAlbumFactory.js';
import { buildRawRoonAlbum } from '../__factories__/rawRoonAlbumFactory.js';
import { buildRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import {
  buildRoonTrack,
  createRoonTrack,
} from '../__factories__/roonTrackFactory.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import knexConfig from '../knexfile.js';
import * as browser from '../src/browser.js';
import {
  createAlbumAggregateWithRoonAlbum,
  createAlbumAggregateWithRoonTracks,
  getRoonAlbums,
  getRoonTracks,
  initializeRoonData,
  mergePersistedRoonAlbum,
} from '../src/roonData.js';

describe('mergePersistedRoonAlbum', () => {
  it('returns a merged Roon album if data is present in the database', () => {
    const albumId = '019bd187-1aea-74ba-9b84-ec279f4354dd';
    const mbCandidatesFetchedAt = '2026-02-02 22:10';
    const mbCandidatesMatchedAt = '2026-02-02 22:11';
    const rawRoonAlbum = buildRawRoonAlbum();
    const persistedRoonAlbum = buildPersistedRoonAlbum({
      albumId,
      mbCandidatesFetchedAt,
      mbCandidatesMatchedAt,
    });

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      ok(persistedRoonAlbum),
    );

    expect(roonAlbum.albumId).toEqual(albumId);
    expect(roonAlbum.roonAlbumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.roonAlbumArtistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.mbCandidatesFetchedAt).toEqual(mbCandidatesFetchedAt);
    expect(roonAlbum.mbCandidatesMatchedAt).toEqual(mbCandidatesMatchedAt);
  });

  it('assigns a new albumId if data is not present in the database', () => {
    const rawRoonAlbum = buildRawRoonAlbum();

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      err({
        error: 'repository.ts: fetchRoonAlbum(): Error: roonAlbumNotFound',
        roonAlbumName: rawRoonAlbum.title,
        roonAlbumArtistName: rawRoonAlbum.subtitle,
      }),
    );

    expect(roonAlbum.albumId.length).toEqual(36);
    expect(roonAlbum.roonAlbumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.roonAlbumArtistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.mbCandidatesFetchedAt).toEqual(null);
    expect(roonAlbum.mbCandidatesMatchedAt).toEqual(null);
  });
});

describe('getRoonAlbums', () => {
  let testDb: Knex<DatabaseSchema>;
  let mockBrowseInstance: RoonApiBrowse;

  beforeEach(async () => {
    testDb = knexInit(knexConfig.test);

    await testDb.migrate.latest({
      directory: './migrations',
    });

    mockBrowseInstance = {} as RoonApiBrowse;
  });

  afterEach(async () => {
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('should handle new albums not in the database', async () => {
    vi.spyOn(browser, 'loadAlbums').mockResolvedValue({
      items: [
        {
          title: 'New Album',
          subtitle: 'New Artist',
          image_key: 'img123',
          item_key: 'item123',
          hint: 'list',
        },
      ],
      offset: 0,
      list: {
        level: 1,
        title: 'Albums',
        subtitle: null,
        imageKey: null,
        count: 10,
        displayOffset: null,
      },
    });

    const result = await getRoonAlbums(testDb, mockBrowseInstance);

    expect(result).toHaveLength(1);
    expect(result[0].roonAlbumName).toBe('New Album');
    expect(result[0].roonAlbumArtistName).toBe('New Artist');
    expect(result[0].mbCandidatesFetchedAt).toBeNull();
    expect(result[0].mbCandidatesMatchedAt).toBeNull();

    const dbRows = await testDb('albums').select();
    expect(dbRows).toHaveLength(1);
  });

  it('should reuse persisted data', async () => {
    const albumId = uuidv7();

    await createPersistedRoonAlbum(testDb, {
      albumId,
      roonAlbumName: 'Known Album',
      roonAlbumArtistName: 'Known Artist',
    });

    vi.spyOn(browser, 'loadAlbums').mockResolvedValue({
      items: [
        {
          title: 'Known Album',
          subtitle: 'Known Artist',
          image_key: 'img123',
          item_key: 'item123',
          hint: 'list',
        },
      ],
      offset: 0,
      list: {
        level: 1,
        title: 'Albums',
        subtitle: null,
        imageKey: null,
        count: 10,
        displayOffset: null,
      },
    });

    const result = await getRoonAlbums(testDb, mockBrowseInstance);

    expect(result[0].albumId).toBe(albumId);
    expect(result[0].roonAlbumName).toBe('Known Album');
    expect(result[0].roonAlbumArtistName).toBe('Known Artist');

    const dbRows = await testDb('albums').select();
    expect(dbRows).toHaveLength(1);
  });
});

describe('createAlbumAggregateWithRoonAlbum', () => {
  it('returns an album aggregate in stage "withRoonAlbum"', () => {
    const roonAlbum = buildRoonAlbum();

    const albumAggregate = createAlbumAggregateWithRoonAlbum(roonAlbum);

    expect(albumAggregate.stage).toEqual('withRoonAlbum');
    expect(albumAggregate.id).toEqual(roonAlbum.albumId);
    expect(albumAggregate.roonAlbum.roonAlbumName).toEqual(
      roonAlbum.roonAlbumName,
    );
    expect(albumAggregate.roonAlbum.roonAlbumArtistName).toEqual(
      roonAlbum.roonAlbumArtistName,
    );
    expect(albumAggregate.roonAlbum.imageKey).toEqual(roonAlbum.imageKey);
    expect(albumAggregate.roonAlbum.itemKey).toEqual(roonAlbum.itemKey);
  });
});

describe('getRoonTracks', () => {
  const response = {
    items: [
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        item_key: '128:1',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        item_key: '128:2',
      },
    ],
    list: {
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      image_key: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
    },
  };

  let testDb: Knex<DatabaseSchema>;
  let mockBrowseInstance: RoonApiBrowse;

  beforeEach(async () => {
    testDb = knexInit(knexConfig.test);

    await testDb.migrate.latest({
      directory: './migrations',
    });

    mockBrowseInstance = {} as RoonApiBrowse;
  });

  afterEach(async () => {
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('should handle albums whose tracks are not in the database', async () => {
    const albumId = uuidv7();
    const roonAlbum: RoonAlbum = buildRoonAlbum({
      albumId,
      roonAlbumName: '12 Golden Country Greats',
      roonAlbumArtistName: 'Ween',
    });
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    await createPersistedRoonAlbum(testDb, {
      albumId,
      roonAlbumName: '12 Golden Country Greats',
      roonAlbumArtistName: 'Ween',
    });

    vi.spyOn(browser, 'loadAlbum').mockResolvedValue(response);

    const result = await getRoonTracks(
      testDb,
      mockBrowseInstance,
      albumAggregateWithRoonAlbum,
    );

    expect(result).toHaveLength(2);
    expect(result[0].albumId).toBe(albumId);
    expect(result[0].roonTrackName).toBe("I'm Holding You");
    expect(result[1].albumId).toBe(albumId);
    expect(result[1].roonTrackName).toBe('Japanese Cowboy');

    const dbRows = await testDb('tracks').select();
    expect(dbRows).toHaveLength(2);
  });

  it('should reuse persisted data', async () => {
    const albumId = uuidv7();
    const roonAlbum = buildRoonAlbum({
      albumId,
      roonAlbumName: '12 Golden Country Greats',
      roonAlbumArtistName: 'Ween',
    });
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    await createPersistedRoonAlbum(testDb, {
      albumId,
      roonAlbumName: '12 Golden Country Greats',
      roonAlbumArtistName: 'Ween',
    });
    const trackId1 = uuidv7();
    await createRoonTrack(testDb, {
      trackId: trackId1,
      albumId,
      roonTrackName: "I'm Holding You",
      roonNumber: '1',
      roonPosition: 1,
    });
    const trackId2 = uuidv7();
    await createRoonTrack(testDb, {
      trackId: trackId2,
      albumId,
      roonTrackName: 'Japanese Cowboy',
      roonNumber: '2',
      roonPosition: 2,
    });

    const result = await getRoonTracks(
      testDb,
      mockBrowseInstance,
      albumAggregateWithRoonAlbum,
    );

    expect(result).toHaveLength(2);
    expect(result[0].albumId).toBe(albumId);
    expect(result[0].roonTrackName).toBe("I'm Holding You");
    expect(result[1].albumId).toBe(albumId);
    expect(result[1].roonTrackName).toBe('Japanese Cowboy');
  });
});

describe('createAlbumAggregateWithRoonTracks', () => {
  it('returns an album aggregate in stage "withRoonAlbum"', () => {
    const roonAlbum = buildRoonAlbum();
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    const trackId1 = uuidv7();
    const trackId2 = uuidv7();
    const roonTracks = [
      buildRoonTrack({
        trackId: trackId1,
        roonTrackName: "I'm Holding You",
      }),
      buildRoonTrack({
        trackId: trackId2,
        roonTrackName: 'Japanese Cowboy',
      }),
    ];
    const albumAggregate = createAlbumAggregateWithRoonTracks(
      albumAggregateWithRoonAlbum,
      roonTracks,
    );

    expect(albumAggregate.stage).toEqual('withRoonTracks');
    expect(albumAggregate.id).toEqual(roonAlbum.albumId);
    expect(albumAggregate.roonTracks).toHaveLength(2);
    expect(albumAggregate.roonTracks[0].trackId).toEqual(roonTracks[0].trackId);
    expect(albumAggregate.roonTracks[1].trackId).toEqual(roonTracks[1].trackId);
  });
});

describe('initializeRoonData', () => {
  const loadAlbumsResponse = {
    items: [
      {
        title: '12 Golden Country Greats',
        subtitle: 'Ween',
        image_key: 'img123',
        item_key: '12345:99',
        hint: 'list',
      },
    ],
    offset: 0,
    list: {
      level: 1,
      title: 'Albums',
      subtitle: null,
      imageKey: null,
      count: 1,
      displayOffset: null,
    },
  };

  const loadAlbumResponse = {
    items: [
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        item_key: '128:1',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        item_key: '128:2',
      },
    ],
    offset: 0,
    list: {
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      image_key: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
    },
  };

  let testDb: Knex<DatabaseSchema>;
  let mockBrowseInstance: RoonApiBrowse;

  beforeEach(async () => {
    testDb = knexInit(knexConfig.test);

    await testDb.migrate.latest({
      directory: './migrations',
    });

    mockBrowseInstance = {} as RoonApiBrowse;
  });

  afterEach(async () => {
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('returns a list of album aggregates in stage "withRoonTracks"', async () => {
    vi.spyOn(browser, 'loadAlbums').mockResolvedValue(loadAlbumsResponse);
    vi.spyOn(browser, 'loadAlbum').mockResolvedValue(loadAlbumResponse);

    const result = await initializeRoonData(testDb, mockBrowseInstance);

    expect(result).toHaveLength(1);
    expect(result[0].stage).toBe('withRoonTracks');
    expect(result[0].roonAlbum.roonAlbumName).toBe('12 Golden Country Greats');
    expect(result[0].roonTracks[0].roonTrackName).toBe("I'm Holding You");
    expect(result[0].roonTracks[1].roonTrackName).toBe('Japanese Cowboy');
  });
});
