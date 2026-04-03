import { Knex } from 'knex';

export function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE mb_artists (
      mb_artist_id TEXT NOT NULL
        CHECK (length(mb_artist_id) = 36),
      name TEXT NOT NULL,
      sort_name TEXT NOT NULL,
      disambiguation TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (mb_artist_id)
    );
  `);
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('mb_artists');
}
