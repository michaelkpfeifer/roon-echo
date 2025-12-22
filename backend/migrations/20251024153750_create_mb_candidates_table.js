/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE mb_candidates (
      mb_album_id TEXT NOT NULL
        CHECK (length(mb_album_id) = 36),
      roon_album_id TEXT NOT NULL
        CHECK (length(roon_album_id) = 36),
      type TEXT NOT NULL,
      score INTEGER,
      priority INTEGER,
      track_count INTEGER,
      release_date DATETIME,
      mb_candidte_album_name TEXT NOT NULL,
      mb_candidate_artists TEXT NOT NULL,
      mb_candidate_tracks TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(roon_album_id) REFERENCES roon_albums(roon_album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (roon_album_id, mb_album_id)
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
