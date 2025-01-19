/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('tracks', (table) => {
    table.increments('id').primary();
    table
      .integer('album_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('albums')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('mb_track_id').notNullable();
    table.string('name').notNullable();
    table.string('number').notNullable();
    table.integer('position').notNullable();
    table.integer('length').notNullable();
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('tracks');
}
