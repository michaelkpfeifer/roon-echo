/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE tracks (
      track_id TEXT NOT NULL
        CHECK (length(track_id) = 36),
      album_id TEXT NOT NULL
        CHECK (length(album_id) = 36),
      roon_track_name TEXT NOT NULL,
      roon_number TEXT NOT NULL,
      roon_position INTEGER NOT NULL,
      mb_track_name TEXT,
      mb_number TEXT ,
      mb_position INTEGER,
      mb_length INTEGER,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(album_id) REFERENCES albums(album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (track_id)
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('tracks');
}
