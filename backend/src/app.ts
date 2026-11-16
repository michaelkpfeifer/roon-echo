import type { Knex } from 'knex';
import express from 'express';

import { createAlbumRouter } from './http/albumRouter.js';
import type { DatabaseSchema } from '../databaseSchema.ts';

const createApp = (db: Knex<DatabaseSchema>) => {
  const app = express();
  app.use('/api/albums', createAlbumRouter(db));

  return app;
};

export { createApp };
