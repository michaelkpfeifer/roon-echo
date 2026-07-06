import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE tags (
      tag_id TEXT NOT NULL CHECK (length(tag_id) = 36),
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      background_color TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (tag_id)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tags');
}
