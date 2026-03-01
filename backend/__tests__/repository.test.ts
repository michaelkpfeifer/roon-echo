import knexInit from 'knex';
import type { Knex } from 'knex';
import type { Result } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { MbAlbum } from '../../shared/internal/mbAlbum.js';
import type { MbArtist } from '../../shared/internal/mbArtist.js';
import type { MbCandidate } from '../../shared/internal/mbCandidate.js';
import type { MbCandidateArtist } from '../../shared/internal/mbCandidateArtist.js';
import type { MbCandidateTrack } from '../../shared/internal/mbCandidateTrack.js';
import type { MbTrack } from '../../shared/internal/mbTrack.js';
import type { PersistedRoonAlbum } from '../../shared/internal/persistedRoonAlbum.js';
import { createAlbumRow } from '../__factories__/albumRowFactory.js';
import { linkAlbumAndMbArtist } from '../__factories__/albumsMbArtistsFactory.js';
import { createMbArtist } from '../__factories__/mbArtistFactory.js';
import { buildMbCandidateArtist } from '../__factories__/mbCandidateArtistFactory.js';
import { buildMbCandidate } from '../__factories__/mbCandidateFactory.js';
import { buildMbCandidateTrack } from '../__factories__/mbCandidateTrackFactory.js';
import { createPersistedRoonTrack } from '../__factories__/persistedRoonTrackFactory.js';
import { buildRawRoonAlbum } from '../__factories__/rawRoonAlbumFactory.js';
import { createRoonAlbum } from '../__factories__/roonAlbumFactory.js';
import {
  buildRoonTrack,
  createRoonTrack,
} from '../__factories__/roonTrackFactory.js';
import { createTrackRow } from '../__factories__/trackRowFactory.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import knexConfig from '../knexfile.js';
import {
  fetchMbAlbumByAlbumId,
  fetchMbArtistsByAlbumId,
  fetchMbTracksByAlbumId,
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

describe('fetchMbAlbumByAlbumId', () => {
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
    const albumId = '019c9144-309f-72d5-96d1-5d910ba58830';
    const fetchMbAlbumResult: Result<
      MbAlbum,
      {
        error: string;
        albumId: string;
      }
    > = await fetchMbAlbumByAlbumId(testDb, albumId);

    expect(fetchMbAlbumResult.isErr()).toBe(true);
    if (fetchMbAlbumResult.isErr()) {
      expect(fetchMbAlbumResult.error.error).toMatch(/mbAlbumNotFound/);
      expect(fetchMbAlbumResult.error.albumId).toBe(albumId);
    }
  });

  it('returns a success result if the album can be found', async () => {
    const albumId = '019c9144-309f-72d5-96d1-5d910ba58830';
    const mbAlbumId = '019c9160-0fbd-7d8f-8b24-7b511bfeaaf8';
    const albumRow = await createAlbumRow(testDb, {
      albumId,
      mbAlbumId,
    });

    const fetchMbAlbumResult: Result<
      MbAlbum,
      {
        error: string;
        albumId: string;
      }
    > = await fetchMbAlbumByAlbumId(testDb, albumId);

    expect(fetchMbAlbumResult.isOk()).toBe(true);
    if (fetchMbAlbumResult.isOk()) {
      expect(fetchMbAlbumResult.value.albumId).toBe(albumId);
      expect(fetchMbAlbumResult.value.mbAlbumId).toBe(mbAlbumId);
      expect(fetchMbAlbumResult.value.mbAlbumName).toBe(albumRow.mbAlbumName);
    }
  });
});

describe('fetchMbArtistsByAlbumId', () => {
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

  it('returns a list of MusicBrainz artists for the given album ID', async () => {
    const albumId = '019ca546-7354-7844-b498-1960158aed07';
    const mbArtistId1 = '019ca546-a88e-7168-977e-c23af9d33cfd';
    const mbArtistId2 = '019ca546-d387-7365-bbae-7320b56a987d';

    await createRoonAlbum(testDb, { albumId });
    await createMbArtist(testDb, {
      mbArtistId: mbArtistId1,
      name: 'Artist 1',
      sortName: 'Artist 1',
    });
    await createMbArtist(testDb, {
      mbArtistId: mbArtistId2,
      name: 'Artist 2',
      sortName: 'Artist 2',
    });
    await linkAlbumAndMbArtist(testDb, {
      albumId,
      mbArtistId: mbArtistId1,
      position: 1,
      joinphrase: '',
    });
    await linkAlbumAndMbArtist(testDb, {
      albumId,
      mbArtistId: mbArtistId2,
      position: 2,
      joinphrase: '',
    });

    const mbArtists: MbArtist[] = await fetchMbArtistsByAlbumId(
      testDb,
      albumId,
    );

    expect(
      new Set(
        mbArtists.map((mbArtist) => [
          mbArtist.mbArtistId,
          mbArtist.name,
          mbArtist.sortName,
        ]),
      ),
    ).toEqual(
      new Set([
        [mbArtistId1, 'Artist 1', 'Artist 1'],
        [mbArtistId2, 'Artist 2', 'Artist 2'],
      ]),
    );
  });
});

describe('fetchMbTracksByAlbumId', () => {
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

  it('returns a list of MusicBrainz tracks with the given album ID', async () => {
    const albumId = '019c9bf4-7822-7dec-8a0a-13826b3094df';
    const trackId1 = '019c9bf6-1a50-74fc-9a3a-9a807a39e72c';
    const trackId2 = '019c9bf6-45a5-7492-971b-c7838c96bac6';
    const mbTrackId1 = '019c9ff2-0a1d-7c2d-8e29-f4629e39fb81';
    const mbTrackId2 = '019c9ff2-486f-768d-a1a5-cd2a8bf1e99a';
    await createRoonAlbum(testDb, {
      albumId,
    });
    await createTrackRow(testDb, {
      albumId,
      trackId: trackId1,
      mbTrackId: mbTrackId1,
    });
    await createTrackRow(testDb, {
      albumId,
      trackId: trackId2,
      mbTrackId: mbTrackId2,
    });

    const mbTracks: MbTrack[] = await fetchMbTracksByAlbumId(testDb, albumId);

    expect(
      new Set(
        mbTracks.map((mbTrack) => [
          mbTrack.albumId,
          mbTrack.trackId,
          mbTrack.mbTrackId,
        ]),
      ),
    ).toEqual(
      new Set([
        [albumId, trackId1, mbTrackId1],
        [albumId, trackId2, mbTrackId2],
      ]),
    );
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
