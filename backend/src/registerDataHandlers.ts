import type { Socket } from 'socket.io';
import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.ts';
import {
  deleteTag,
  fetchAllAlbumTags,
  insertTag,
  listTags,
  updateTag,
} from './repository.js';

const registerDataHandlers = (socket: Socket, db: Knex<DatabaseSchema>) => {
  socket.on('tags:list', async (callback) => {
    const result = await listTags(db);

    result.match(
      (tags) => callback({ ok: true, value: tags }),
      (error) => callback({ ok: false, error }),
    );
  });

  socket.on('tags:create', async (payload, callback) => {
    const result = await insertTag(db, payload);

    result.match(
      (tag) => callback({ ok: true, value: tag }),
      (error) => callback({ ok: false, error }),
    );
  });

  socket.on('tags:update', async (tag, callback) => {
    const result = await updateTag(db, tag);

    result.match(
      (tag) => callback({ ok: true, value: tag }),
      (error) => callback({ ok: false, error }),
    );
  });

  socket.on('tags:delete', async ({ tagId }, callback) => {
    const result = await deleteTag(db, tagId);

    result.match(
      () => callback({ ok: true }),
      (error) => callback({ ok: false, error }),
    );
  });

  socket.on('albumsTags:list', async (callback) => {
    const result = await fetchAllAlbumTags(db);

    result.match(
      (albumsTags) => callback({ ok: true, value: albumsTags }),
      (error) => callback({ ok: false, error }),
    );
  });

  socket.on('disconnect', () => {
    /* eslint-disable no-console */
    console.log('server.js: disconnected: socket.id', socket.id);
    /* eslint-enable no-console */
  });
};

export { registerDataHandlers };
