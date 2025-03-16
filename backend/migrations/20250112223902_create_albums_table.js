/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('albums', (table) => {
    table.string('mb_album_id').notNullable().primary();
    table.string('roon_artist_name').notNullable();
    table.string('roon_album_name').notNullable();
    table.string('mb_release_date');

    table.unique(
      ['roon_artist_name', 'roon_album_name'],
      'albums_unique_on_artist_name_album_name',
    );

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('albums');
}
