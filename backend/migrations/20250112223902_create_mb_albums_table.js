/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE mb_albums (
      mb_album_id TEXT NOT NULL
        CHECK (length(mb_album_id) = 36),
      album_id TEXT NOT NULL
        CHECK (length(album_id) = 36),
      album_name TEXT NOT NULL,
      score INTEGER,
      track_count INTEGER,
      release_date TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(album_id) REFERENCES albums(album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (mb_album_id, album_id)
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_albums');
}
