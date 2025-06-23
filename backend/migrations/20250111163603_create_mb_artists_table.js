/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('mb_artists', (table) => {
    table.text('mb_artist_id').notNullable().primary();
    table.text('name').notNullable();
    table.text('sort_name').notNullable();
    table.text('type');
    table.text('disambiguation');

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_artists');
}
