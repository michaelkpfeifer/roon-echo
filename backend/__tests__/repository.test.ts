import knexInit from 'knex';
import type { Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createPersistedRoonTrack } from '../__factories__/persistedRoonTrackFactory.js';
import { createRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import knexConfig from '../knexfile.js';
import { fetchRoonTracks } from '../src/repository.js';

describe('fetchRoonTracks', () => {
  let testDb: Knex<DatabaseSchema>;

  beforeEach(async () => {
    testDb = knexInit(knexConfig.test);

    await testDb.migrate.latest({
      directory: './migrations',
    });
  });

  afterEach(async () => {
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('should return an empty array if there is nothing in the database', async () => {
    const roonAlbum = await createRoonAlbum(testDb, {});

    const roonTracks = await fetchRoonTracks(testDb, roonAlbum);

    expect(roonTracks).toEqual([]);
  });

  it('should return the list of tracks belonging to a given album', async () => {
    const roonAlbum = await createRoonAlbum(testDb, {});

    const trackId1 = '019c84e0-57ce-7b4a-95ed-9662da873f9c';
    const trackId2 = '019c84e1-0e42-7d64-9a9e-61752d8c200f';

    await createPersistedRoonTrack(testDb, {
      albumId: roonAlbum.albumId,
      trackId: trackId1,
      roonTrackName: 'Track 1',
      roonNumber: '1',
      roonPosition: 1,
    });

    await createPersistedRoonTrack(testDb, {
      albumId: roonAlbum.albumId,
      trackId: trackId2,
      roonTrackName: 'Track 2',
      roonNumber: '2',
      roonPosition: 2,
    });

    const roonTracks = await fetchRoonTracks(testDb, roonAlbum);

    expect(roonTracks).toHaveLength(2);
    expect(new Set(roonTracks.map((t) => t.trackId))).toStrictEqual(
      new Set([trackId1, trackId2]),
    );
  });
});
