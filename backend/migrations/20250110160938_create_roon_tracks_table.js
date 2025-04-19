/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('roon_tracks', (table) => {
    table.increments('id').primary();
    table
      .integer('roon_album_id')
      .notNullable()
      .references('id')
      .inTable('roon_albums')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.text('track_name').notNullable();
    table.text('number').notNullable();
    table.integer('position').notNullable();

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_tracks');
}
