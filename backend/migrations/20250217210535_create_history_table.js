/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE history (
      id INTEGER NOT NULL primary key autoincrement,
      mb_track_id TEXT NOT NULL
        CHECK (length(mb_track_id) = 36),
      track_name TEXT NOT NULL,
      album_name TEXT NOT NULL,
      artist_names TEXT NOT NULL,
      played_at TEXT NOT NULL,
      fraction_played FLOAT NOT NULL,
      is_played BOOLEAN NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(mb_track_id) REFERENCES mb_tracks(mb_track_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('history');
}
