/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('history', (table) => {
    table.increments('id');
    table
      .string('mb_track_id')
      .notNullable()
      .references('mb_track_id')
      .inTable('tracks')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('mbTrackName').notNullable();
    table.string('mbAlbumName').notNullable();
    table.string('mbArtistNames').notNullable();

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
