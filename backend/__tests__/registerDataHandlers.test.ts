import { err } from 'neverthrow';
import knexInit from 'knex';
import { createServer } from 'node:http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import type { Socket as ClientSocket } from 'socket.io-client';
import type { Knex } from 'knex';
import type { AddressInfo } from 'node:net';

import type { DatabaseSchema } from '../databaseSchema.js';
import { registerDataHandlers } from '../src/registerDataHandlers.js';
import { createAlbumData } from '../__factories__/albumDataFactory.js';
import { createTag } from '../__factories__/tagFactory.js';
import knexConfig from '../knexfile.js';
import { fetchAllAlbumTags } from '../src/repository.js';

import type * as Repository from '../src/repository.js';

vi.mock('../src/repository.js', async (importOriginal) => {
  const actual = await importOriginal<typeof Repository>();
  return { ...actual, fetchAllAlbumTags: vi.fn(actual.fetchAllAlbumTags) };
});

describe('albumsTags:list', () => {
  let testDb: Knex<DatabaseSchema>;
  let io: Server;
  let client: ClientSocket;

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

  beforeEach(async () => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on('connection', (socket) => registerDataHandlers(socket, testDb));

    await new Promise<void>((resolve) => httpServer.listen(resolve));
    const { port } = httpServer.address() as AddressInfo;

    client = Client(`http://localhost:${port}`);
    await new Promise<void>((resolve) => client.on('connect', resolve));
  });

  afterEach(async () => {
    client.close();
    await io.close();
  });

  it('responds with the tags', async () => {
    const album = await createAlbumData(testDb, {});
    const tag = await createTag(testDb, {});
    await testDb<DatabaseSchema['albums_tags']>('albums_tags').insert({
      album_id: album.albumId,
      tag_id: tag.tagId,
    });

    const response = await client.emitWithAck('albumsTags:list');

    expect(response).toEqual({
      ok: true,
      value: {
        [album.albumId]: [tag.tagId],
      },
    });
  });
});

describe('albumsTags:list when something unexpected happens', () => {
  let io: Server;
  let client: ClientSocket;

  beforeEach(async () => {
    const httpServer = createServer();
    io = new Server(httpServer);
    io.on('connection', (socket) =>
      registerDataHandlers(socket, {} as Knex<DatabaseSchema>),
    );

    await new Promise<void>((resolve) => httpServer.listen(resolve));
    const { port } = httpServer.address() as AddressInfo;

    client = Client(`http://localhost:${port}`);
    await new Promise<void>((resolve) => client.on('connect', resolve));
  });

  afterEach(async () => {
    client.close();
    await io.close();
  });

  it('responds with an error', async () => {
    vi.mocked(fetchAllAlbumTags).mockResolvedValueOnce(err('boom'));

    const response = await client.emitWithAck('albumsTags:list');

    expect(response).toEqual({ ok: false, error: 'boom' });
  });
});
