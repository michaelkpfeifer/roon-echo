import type { Express } from 'express';
import knexInit from 'knex';
import type { Knex } from 'knex';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { v7 as uuidv7 } from 'uuid';

import type { DatabaseSchema } from '../../databaseSchema.js';
import knexConfig from '../../knexfile.js';
import { createApp } from '../../src/app.js';
import { createAlbumData } from '../../__factories__/albumDataFactory.js';
import { createTag } from '../../__factories__/tagFactory.js';

describe('album router', () => {
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

  let app: Express;

  beforeEach(() => {
    app = createApp(testDb);
  });

  describe('add tag to album', () => {
    it('adds a tag to an album', async () => {
      const album = await createAlbumData(testDb, { albumId: uuidv7() });
      const tag = await createTag(testDb, { tagId: uuidv7() });

      const res = await request(app)
        .put(`/api/albums/${album.albumId}/tags/${tag.tagId}`)
        .send({});
      const associations = await testDb<DatabaseSchema['albums_tags']>(
        'albums_tags',
      ).where({
        album_id: album.albumId,
        tag_id: tag.tagId,
      });

      expect(res.status).toBe(201);
      expect(associations.length).toBe(1);
      expect(associations[0].album_id).toBe(album.albumId);
      expect(associations[0].tag_id).toBe(tag.tagId);
    });

    it('returns 404 if the album cannot be found', async () => {
      const tag = await createTag(testDb, { tagId: uuidv7() });

      const res = await request(app)
        .put(`/api/albums/${uuidv7()}/tags/${tag.tagId}`)
        .send({});

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({ error: 'album-not-found' });
    });

    it('returns 404 if the tag cannot be found', async () => {
      const album = await createAlbumData(testDb, { albumId: uuidv7() });

      const res = await request(app)
        .put(`/api/albums/${album.albumId}/tags/${uuidv7()}`)
        .send({});

      expect(res.status).toBe(404);
      expect(res.body).toStrictEqual({ error: 'tag-not-found' });
    });
  });

  describe('fetch all album tags', () => {
    it('returns a list of all album tags', async () => {
      const album1 = await createAlbumData(testDb, {
        albumId: uuidv7(),
        roonAlbumName: 'Album 1',
      });
      const album2 = await createAlbumData(testDb, {
        albumId: uuidv7(),
        roonAlbumName: 'Album 2',
      });
      const tag11 = await createTag(testDb, { tagId: uuidv7(), name: 'tag11' });
      const tag12 = await createTag(testDb, { tagId: uuidv7(), name: 'tag12' });
      const tag21 = await createTag(testDb, { tagId: uuidv7(), name: 'tag21' });

      await testDb<DatabaseSchema['albums_tags']>('albums_tags').insert({
        album_id: album1.albumId,
        tag_id: tag11.tagId,
      });
      await testDb<DatabaseSchema['albums_tags']>('albums_tags').insert({
        album_id: album1.albumId,
        tag_id: tag12.tagId,
      });
      await testDb<DatabaseSchema['albums_tags']>('albums_tags').insert({
        album_id: album2.albumId,
        tag_id: tag21.tagId,
      });

      const res = await request(app).get('/api/albums/tags').send({});

      expect(res.status).toBe(200);
      expect(res.body[album1.albumId].sort()).toStrictEqual(
        [tag11.tagId, tag12.tagId].sort(),
      );
      expect(res.body[album2.albumId]).toStrictEqual([tag21.tagId]);
    });
  });
});

describe('album router when something unexpected happens', () => {
  const failingDb = (() => {
    throw new Error('boom');
  }) as unknown as Knex<DatabaseSchema>;

  let app: Express;

  beforeEach(() => {
    app = createApp(failingDb);
  });

  describe('add tag to album when something unexpected happens', async () => {
    it('returns 500 if an unexpected error occurs', async () => {
      const res = await request(app)
        .put(`/api/albums/${uuidv7()}/tags/${uuidv7()}`)
        .send({});

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({ error: 'Error: boom' });
    });
  });

  describe('fetch all album tags when something unexpected happens', () => {
    it('returns 500 if an unexpected error occurs', async () => {
      const res = await request(app).get('/api/albums/tags').send({});

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({ error: 'Error: boom' });
    });
  });
});
