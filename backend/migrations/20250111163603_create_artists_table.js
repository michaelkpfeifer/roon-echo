/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('artists', (table) => {
    table.string('mb_artist_id').notNullable().primary();
    table.string('name').notNullable();
    table.string('sort_name').notNullable();
    table.string('type').notNullable();
    table.string('disambiguation').notNullable();

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('artists');
}
