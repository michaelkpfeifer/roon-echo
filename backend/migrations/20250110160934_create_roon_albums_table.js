/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('roon_albums', (table) => {
    table.text('id').primary();
    table.text('album_name').notNullable();
    table.text('artist_name').notNullable();

    table.timestamps(true, true);

    table.unique(['album_name', 'artist_name']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_albums');
}
