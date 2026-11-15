import type { Knex } from 'knex';
import express from 'express';

import type { DatabaseSchema } from '../databaseSchema.ts';

const createApp = (db: Knex<DatabaseSchema>) => {
  const app = express();

  return app;
};

export { createApp };
