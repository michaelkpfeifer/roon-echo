/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('roon_albums', (table) => {
    table.increments('id').primary();
    table.text('title').notNullable();
    table.text('artist').notNullable();

    table.timestamps(true, true);

    table.unique(['title', 'artist']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_albums');
}
