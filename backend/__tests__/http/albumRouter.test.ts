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

  describe('add tag to album when something unexpected happens', async () => {
    const failingDb = (() => {
      throw new Error('boom');
    }) as unknown as Knex<DatabaseSchema>;

    beforeEach(() => {
      app = createApp(failingDb);
    });

    it('returns 500 if an unexpected error occurs', async () => {
      const res = await request(app)
        .put(`/api/albums/${uuidv7()}/tags/${uuidv7()}`)
        .send({});

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({ error: 'Error: boom' });
    });
  });
});
