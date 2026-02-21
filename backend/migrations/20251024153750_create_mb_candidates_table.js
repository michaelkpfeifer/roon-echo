/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE mb_candidates (
      album_id TEXT NOT NULL
        CHECK (length(album_id) = 36),
      score INTEGER,
      track_count INTEGER,
      release_date DATETIME,
      mb_candidate_album_name TEXT NOT NULL,
      mb_candidate_artists TEXT NOT NULL,
      mb_candidate_tracks TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(album_id) REFERENCES albums(album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (album_id)
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_candidates');
}
