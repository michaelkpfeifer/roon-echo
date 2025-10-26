/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE mb_albums (
      mb_album_id TEXT NOT NULL,
      roon_album_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      score INTEGER,
      candidate_priority INTEGER,
      track_count INTEGER,
      mb_release_date TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(roon_album_id) REFERENCES roon_albums(roon_album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (mb_album_id)
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
