/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE roon_tracks (
      roon_track_id TEXT NOT NULL
        CHECK (length(roon_track_id) = 36),
      album_id TEXT NOT NULL
        CHECK (length(album_id) = 36),
      track_name TEXT NOT NULL,
      number TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(album_id) REFERENCES albums(album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (roon_track_id)
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_tracks');
}
