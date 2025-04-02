/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('albums', (table) => {
    table.text('mb_album_id').notNullable().primary();
    table.text('roon_artist_name').notNullable();
    table.text('roon_album_name').notNullable();
    table.text('mb_release_date');

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
