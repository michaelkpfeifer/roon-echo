/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('tracks', (table) => {
    table.string('mb_track_id').notNullable().primary();
    table
      .string('mb_album_id')
      .notNullable()
      .references('mb_album_id')
      .inTable('albums')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('name').notNullable();
    table.string('number').notNullable();
    table.integer('position').notNullable();
    table.integer('length');

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
