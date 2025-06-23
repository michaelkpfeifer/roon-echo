/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('mb_albums_mb_artists', (table) => {
    table.text('mb_album_id').notNullable();
    table.text('mb_artist_id').notNullable();

    table
      .foreign('mb_album_id')
      .references('mb_albums.mb_album_id')
      .onDelete('CASCADE');
    table
      .foreign('mb_artist_id')
      .references('mb_artists.mb_artist_id')
      .onDelete('CASCADE');

    table.primary(['mb_album_id', 'mb_artist_id'], 'mb_albums_mb_artists_on_mb_artist_id_mb_album_id',);

    table.index('mb_artist_id', 'mb_albums_mb_artists_on_mb_artist_id');
    table.index('mb_album_id', 'mb_albums_mb_artists_on_mb_album_id');

    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_albums_mb_artists');
}
