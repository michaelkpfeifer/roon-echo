/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.raw(`
    CREATE TABLE plays (
      id TEXT NOT NULL
        CHECK (length(id) = 36),
      roon_track_id TEXT NOT NULL
        CHECK (length(roon_track_id) = 36),
      roon_album_id TEXT NOT NULL
        CHECK (length(roon_album_id) = 36),
      roon_album_name TEXT NOT NULL,
      roon_artist_name TEXT NOT NULL,
      roon_track_name TEXT NOT NULL,
      number TEXT NOT NULL,
      position INTEGER NOT NULL,
      played_at TEXT NOT NULL,
      fraction_played FLOAT NOT NULL,
      is_played BOOLEAN NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(roon_track_id) REFERENCES roon_tracks(roon_track_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      FOREIGN KEY(roon_album_id) REFERENCES roon_albums(roon_album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (id)
    );
  `);

  await knex.raw(`
    CREATE INDEX plays_roon_album_artist_track_name
      ON plays (roon_album_name, roon_artist_name, roon_track_name);
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('plays');
}
