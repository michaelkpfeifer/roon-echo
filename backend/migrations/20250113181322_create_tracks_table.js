/**
 * @Pam { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('tracks', (table) => {
    table.text('mb_track_id').notNullable().primary();
    table
      .text('mb_album_id')
      .notNullable()
      .references('mb_album_id')
      .inTable('mb_albums')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.text('name').notNullable();
    table.text('number').notNullable();
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
