import knexInit from 'knex';
import type { Knex } from 'knex';
import { err, ok } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    const roonAlbumId = '019bd187-1aea-74ba-9b84-ec279f4354dd';
    const candidatesFetchedAt = '2026-02-02 22:10';
    const candidatesMatchedAt = '2026-02-02 22:11';
    const rawRoonAlbum = buildRawRoonAlbum();
    const persistedRoonAlbum = buildPersistedRoonAlbum({
      roonAlbumId,
      candidatesFetchedAt,
      candidatesMatchedAt,
    });

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      ok(persistedRoonAlbum),
    );

    expect(roonAlbum.roonAlbumId).toEqual(roonAlbumId);
    expect(roonAlbum.albumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.artistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.candidatesFetchedAt).toEqual(candidatesFetchedAt);
    expect(roonAlbum.candidatesMatchedAt).toEqual(candidatesMatchedAt);
  });

  it('assigns a new albumId if data is not present in the database', () => {
    const rawRoonAlbum = buildRawRoonAlbum();

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      err({
        error: 'repository.ts: fetchRoonAlbum(): Error: roonAlbumNotFound',
        albumName: rawRoonAlbum.title,
        artistName: rawRoonAlbum.subtitle,
      }),
    );

    expect(roonAlbum.roonAlbumId.length).toEqual(36);
    expect(roonAlbum.albumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.artistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.candidatesFetchedAt).toEqual(null);
    expect(roonAlbum.candidatesMatchedAt).toEqual(null);
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
    expect(result[0].albumName).toBe('New Album');
    expect(result[0].artistName).toBe('New Artist');
    expect(result[0].candidatesFetchedAt).toBeNull();
    expect(result[0].candidatesMatchedAt).toBeNull();

    const dbRows = await testDb('roon_albums').select();
    expect(dbRows).toHaveLength(1);
  });

  it('should reuse persisted data', async () => {
    const roonAlbumId = uuidv7();

    await createPersistedRoonAlbum(testDb, {
      roonAlbumId: roonAlbumId,
      albumName: 'Known Album',
      artistName: 'Known Artist',
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

    expect(result[0].roonAlbumId).toBe(roonAlbumId);
    expect(result[0].albumName).toBe('Known Album');
    expect(result[0].artistName).toBe('Known Artist');

    const dbRows = await testDb('roon_albums').select();
    expect(dbRows).toHaveLength(1);
  });
});

describe('createAlbumAggregateWithRoonAlbum', () => {
  it('returns an album aggregate in stage "withRoonAlbum"', () => {
    const roonAlbum = buildRoonAlbum();

    const albumAggregate = createAlbumAggregateWithRoonAlbum(roonAlbum);

    expect(albumAggregate.stage).toEqual('withRoonAlbum');
    expect(albumAggregate.id).toEqual(roonAlbum.roonAlbumId);
    expect(albumAggregate.roonAlbum.albumName).toEqual(roonAlbum.albumName);
    expect(albumAggregate.roonAlbum.artistName).toEqual(roonAlbum.artistName);
    expect(albumAggregate.roonAlbum.imageKey).toEqual(roonAlbum.imageKey);
    expect(albumAggregate.roonAlbum.itemKey).toEqual(roonAlbum.itemKey);
  });
});

describe('getRoonTracks', () => {
  const response = {
    items: [
      {
        title: 'Play Album',
        subtitle: null,
        imageKey: null,
        itemKey: '128:0',
        hint: 'action_list',
      },
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:1',
        hint: 'action_list',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:2',
        hint: 'action_list',
      },
    ],
    offset: 0,
    list: {
      level: 3,
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
      displayOffset: null,
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
    const roonAlbumId = uuidv7();
    const roonAlbum = buildRoonAlbum({
      roonAlbumId: roonAlbumId,
      albumName: '12 Golden Country Greats',
      artistName: 'Ween',
    });
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    await createPersistedRoonAlbum(testDb, {
      roonAlbumId: roonAlbumId,
      albumName: '12 Golden Country Greats',
      artistName: 'Ween',
    });

    vi.spyOn(browser, 'loadAlbum').mockResolvedValue(response);

    const result = await getRoonTracks(
      testDb,
      mockBrowseInstance,
      albumAggregateWithRoonAlbum,
    );

    expect(result).toHaveLength(2);
    expect(result[0].roonAlbumId).toBe(roonAlbumId);
    expect(result[0].trackName).toBe("I'm Holding You");
    expect(result[1].roonAlbumId).toBe(roonAlbumId);
    expect(result[1].trackName).toBe('Japanese Cowboy');

    const dbRows = await testDb('roon_tracks').select();
    expect(dbRows).toHaveLength(2);
  });

  it('should reuse persisted data', async () => {
    const roonAlbumId = uuidv7();
    const roonAlbum = buildRoonAlbum({
      roonAlbumId: roonAlbumId,
      albumName: '12 Golden Country Greats',
      artistName: 'Ween',
    });
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    await createPersistedRoonAlbum(testDb, {
      roonAlbumId: roonAlbumId,
      albumName: '12 Golden Country Greats',
      artistName: 'Ween',
    });
    const roonTrackId1 = uuidv7();
    await createRoonTrack(testDb, {
      roonTrackId: roonTrackId1,
      roonAlbumId: roonAlbumId,
      trackName: "I'm Holding You",
      number: '1',
      position: 1,
    });
    const roonTrackId2 = uuidv7();
    await createRoonTrack(testDb, {
      roonTrackId: roonTrackId2,
      roonAlbumId: roonAlbumId,
      trackName: 'Japanese Cowboy',
      number: '1',
      position: 1,
    });

    const result = await getRoonTracks(
      testDb,
      mockBrowseInstance,
      albumAggregateWithRoonAlbum,
    );

    expect(result).toHaveLength(2);
    expect(result[0].roonAlbumId).toBe(roonAlbumId);
    expect(result[0].trackName).toBe("I'm Holding You");
    expect(result[1].roonAlbumId).toBe(roonAlbumId);
    expect(result[1].trackName).toBe('Japanese Cowboy');
  });
});

describe('createAlbumAggregateWithRoonTracks', () => {
  it('returns an album aggregate in stage "withRoonAlbum"', () => {
    const roonAlbum = buildRoonAlbum();
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);
    const roonTrackId1 = uuidv7();
    const roonTrackId2 = uuidv7();
    const roonTracks = [
      buildRoonTrack({
        roonTrackId: roonTrackId1,
        trackName: "I'm Holding You",
      }),
      buildRoonTrack({
        roonTrackId: roonTrackId2,
        trackName: 'Japanese Cowboy',
      }),
    ];
    const albumAggregate = createAlbumAggregateWithRoonTracks(
      albumAggregateWithRoonAlbum,
      roonTracks,
    );

    expect(albumAggregate.stage).toEqual('withRoonTracks');
    expect(albumAggregate.id).toEqual(roonAlbum.roonAlbumId);
    expect(albumAggregate.roonTracks).toHaveLength(2);
    expect(albumAggregate.roonTracks[0].roonTrackId).toEqual(
      roonTracks[0].roonTrackId,
    );
    expect(albumAggregate.roonTracks[1].roonTrackId).toEqual(
      roonTracks[1].roonTrackId,
    );
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
        title: 'Play Album',
        subtitle: null,
        imageKey: null,
        itemKey: '128:0',
        hint: 'action_list',
      },
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:1',
        hint: 'action_list',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:2',
        hint: 'action_list',
      },
    ],
    offset: 0,
    list: {
      level: 3,
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
      displayOffset: null,
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
    expect(result[0].roonAlbum.albumName).toBe('12 Golden Country Greats');
    expect(result[0].roonTracks[0].trackName).toBe("I'm Holding You");
    expect(result[0].roonTracks[1].trackName).toBe('Japanese Cowboy');
  });
});
