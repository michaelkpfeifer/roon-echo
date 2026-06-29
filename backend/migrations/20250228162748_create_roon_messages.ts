import { Knex } from 'knex';

export function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE roon_messages (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      message TEXT,
      message_type TEXT NOT NULL,
      sub_type TEXT,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('roon_messages');
}
