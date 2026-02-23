import knexInit from 'knex';
import type { Knex } from 'knex';
import type { Result } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { MbCandidate } from '../../shared/internal/mbCandidate.js';
import type { MbCandidateArtist } from '../../shared/internal/mbCandidateArtist.js';
import type { MbCandidateTrack } from '../../shared/internal/mbCandidateTrack.js';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum.js';
import { buildMbCandidateArtist } from '../__factories__/mbCandidateArtistFactory.js';
import { buildMbCandidate } from '../__factories__/mbCandidateFactory.js';
import { buildMbCandidateTrack } from '../__factories__/mbCandidateTrackFactory.js';
import { createPersistedRoonAlbum } from '../__factories__/persistedRoonAlbumFactory.js';
import { createPersistedRoonTrack } from '../__factories__/persistedRoonTrackFactory.js';
import { buildRawRoonAlbum } from '../__factories__/rawRoonAlbumFactory.js';
import { createRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import { buildRoonTrack } from '../__factories__/roonTrackFactory.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import knexConfig from '../knexfile.js';
import {
  fetchRoonAlbum,
  fetchRoonTracks,
  insertRoonTracks,
  normalizeCandidate,
} from '../src/repository.js';

describe('fetchRoonAlbum', () => {
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

  it('returns an error result if the album cannot be found', async () => {
    const rawRoonAlbum = buildRawRoonAlbum({
      title: 'Album Name',
      subtitle: 'Artist Name',
    });

    const fetchRoonAlbumResult: Result<
      PersistedRoonAlbum,
      {
        error: string;
        roonAlbumName: string;
        roonAlbumArtistName: string;
      }
    > = await fetchRoonAlbum(testDb, rawRoonAlbum);

    expect(fetchRoonAlbumResult.isErr()).toBe(true);
    if (fetchRoonAlbumResult.isErr()) {
      expect(fetchRoonAlbumResult.error.error).toMatch(/roonAlbumNotFound/);
      expect(fetchRoonAlbumResult.error.roonAlbumName).toBe('Album Name');
      expect(fetchRoonAlbumResult.error.roonAlbumArtistName).toBe(
        'Artist Name',
      );
    }
  });

  it('returns a success result if the album can be found', async () => {
    const rawRoonAlbum = buildRawRoonAlbum({
      title: 'Album Name',
      subtitle: 'Artist Name',
    });
    const roonAlbum = await createRoonAlbum(testDb, {
      roonAlbumName: 'Album Name',
      roonAlbumArtistName: 'Artist Name',
    });

    const fetchRoonAlbumResult: Result<
      PersistedRoonAlbum,
      {
        error: string;
        roonAlbumName: string;
        roonAlbumArtistName: string;
      }
    > = await fetchRoonAlbum(testDb, rawRoonAlbum);

    expect(fetchRoonAlbumResult.isOk()).toBe(true);
    if (fetchRoonAlbumResult.isOk()) {
      expect(fetchRoonAlbumResult.value.roonAlbumName).toBe('Album Name');
      expect(fetchRoonAlbumResult.value.roonAlbumArtistName).toBe(
        'Artist Name',
      );
      expect(fetchRoonAlbumResult.value.albumId).toBe(roonAlbum.albumId);
    }
  });
});

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

describe('insertRoonTracks', () => {
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

  it('should insert the given Roon tracks into the tracks table', async () => {
    const roonAlbum = await createRoonAlbum(testDb, {});

    const trackId1 = '019c84e0-57ce-7b4a-95ed-9662da873f9c';
    const trackId2 = '019c84e1-0e42-7d64-9a9e-61752d8c200f';

    const roonTrack1 = buildRoonTrack({
      albumId: roonAlbum.albumId,
      trackId: trackId1,
      roonTrackName: 'Track 1',
      roonNumber: '1',
      roonPosition: 1,
    });
    const roonTrack2 = buildRoonTrack({
      albumId: roonAlbum.albumId,
      trackId: trackId2,
      roonTrackName: 'Track 2',
      roonNumber: '2',
      roonPosition: 2,
    });

    await insertRoonTracks(testDb, [roonTrack1, roonTrack2]);

    const roonTracks = await fetchRoonTracks(testDb, roonAlbum);

    expect(roonTracks).toHaveLength(2);
    expect(new Set(roonTracks.map((t) => t.trackId))).toStrictEqual(
      new Set([trackId1, trackId2]),
    );
  });
});
