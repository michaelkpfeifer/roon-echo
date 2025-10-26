/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE roon_tracks (
      id TEXT,
      roon_album_id INTEGER NOT NULL,
      track_name TEXT NOT NULL,
      number TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(roon_album_id) REFERENCES roon_albums(roon_album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (id)
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
