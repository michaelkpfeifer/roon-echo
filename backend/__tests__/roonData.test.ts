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
import type { DatabaseSchema } from '../databaseSchema';
import knexConfig from '../knexfile';
import * as browser from '../src/browser.js';
import { getRoonAlbums, mergePersistedRoonAlbum } from '../src/roonData.js';

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
