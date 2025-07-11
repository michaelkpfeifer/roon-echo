/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('history', (table) => {
    table.increments('id');
    table
      .text('mb_track_id')
      .notNullable()
      .references('mb_track_id')
      .inTable('mb_tracks')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.text('track_name').notNullable();
    table.text('album_name').notNullable();
    table.text('artist_names').notNullable();
    table.text('played_at').notNullable();
    table.float('fraction_played').notNullable();
    table.boolean('is_played').notNullable();

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('history');
}
