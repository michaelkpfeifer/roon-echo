/**
 * @Pam { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.raw(`
    CREATE TABLE mb_tracks (
      mb_track_id TEXT NOT NULL
        CHECK (length(mb_track_id) = 36),
      mb_album_id TEXT NOT NULL
        CHECK (length(mb_album_id) = 36),
      roon_album_id TEXT NOT NULL
        CHECK (length(roon_album_id) = 36),
      name TEXT NOT NULL,
      number TEXT NOT NULL,
      position INTEGER NOT NULL,
      length INTEGER,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(mb_album_id, roon_album_id) REFERENCES mb_albums(mb_album_id, roon_album_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      PRIMARY KEY (mb_track_id, roon_album_id)
    );
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_tracks');
}
