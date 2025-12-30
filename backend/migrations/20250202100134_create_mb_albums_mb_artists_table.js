/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE TABLE mb_albums_mb_artists (
      mb_album_id TEXT NOT NULL
        CHECK (length(mb_album_id) = 36),
      mb_artist_id TEXT NOT NULL
        CHECK (length(mb_artist_id) = 36),
      roon_album_id TEXT NOT NULL
        CHECK (length(roon_album_id) = 36),
      position INTEGER NOT NULL,
      joinphrase TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(mb_album_id, roon_album_id) REFERENCES mb_albums(mb_album_id, roon_album_id)
        ON DELETE CASCADE,
      FOREIGN KEY(mb_artist_id) REFERENCES mb_artists(mb_artist_id)
        ON DELETE CASCADE,
      CONSTRAINT mb_albums_mb_artists_primary_key PRIMARY KEY (mb_album_id, roon_album_id, mb_artist_id)
    );
  `);

  await knex.raw(`
    CREATE INDEX mb_albums_mb_artists_on_mb_artist_id ON mb_albums_mb_artists (mb_artist_id);
  `);

  await knex.raw(`
    CREATE INDEX mb_albums_mb_artists_on_mb_album_id ON mb_albums_mb_artists (mb_album_id);
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_albums_mb_artists');
}
