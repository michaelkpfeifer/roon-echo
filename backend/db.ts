import knexInit from 'knex';
import knexConfig from './knexfile.js';
import type { DatabaseSchema } from './databaseSchema';
import type { Knex } from 'knex';

const environment = (process.env.NODE_ENV ||
  'development') as keyof typeof knexConfig;
const untypedDb = knexInit(knexConfig[environment]);
const db: Knex<DatabaseSchema> = untypedDb;

export { db };
