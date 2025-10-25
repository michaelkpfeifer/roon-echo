/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
      CREATE TABLE candidates (
      mb_album_id CHAR(36) NOT NULL,
      roon_album_id CHAR(36) NOT NULL,
      type TEXT NOT NULL,
      score INTEGER,
      candidate_priority INTEGER,
      track_count INTEGER,
      mb_release_date DATETIME,
      created_at DATETIME NOT NULL default CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL default CURRENT_TIMESTAMP,
      FOREIGN KEY(roon_album_id) REFERENCES roon_albums(id)
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
  return knex.schema.dropTable('candidates');
}
