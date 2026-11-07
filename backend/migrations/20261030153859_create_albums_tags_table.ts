import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('albums_tags', (table) => {
    table
      .text('album_id')
      .notNullable()
      .references('album_id')
      .inTable('albums')
      .onDelete('CASCADE');
    table
      .text('tag_id')
      .notNullable()
      .references('tag_id')
      .inTable('tags')
      .onDelete('CASCADE');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());

    table.primary(['album_id', 'tag_id']);
    table.index('tag_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('albums_tags');
}
