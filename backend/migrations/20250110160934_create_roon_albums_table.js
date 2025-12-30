/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE TABLE roon_albums (
      roon_album_id TEXT NOT NULL
        CHECK (length(roon_album_id) = 36),
      album_name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      candidates_fetched_at DATETIME,
      candidates_matched_at DATETIME,
      created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (roon_album_id)
    );
  `);

  await knex.raw(`
    CREATE UNIQUE INDEX roon_albums_album_name_artist_name_unique ON roon_albums (album_name, artist_name);
  `)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_albums');
}
