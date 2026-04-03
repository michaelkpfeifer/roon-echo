import { Knex } from 'knex';

export function up(knex: Knex): Promise<void> {
  return knex.raw(`
    CREATE TABLE tracks (
      track_id TEXT NOT NULL
        CHECK (length(track_id) = 36),
      album_id TEXT NOT NULL
        CHECK (length(album_id) = 36),
      roon_track_name TEXT NOT NULL,
      roon_number TEXT NOT NULL,
      roon_position INTEGER NOT NULL,
      roon_length INTEGER,
      mb_track_id TEXT
        CHECK (length(track_id) = 36),
      mb_track_name TEXT,
      mb_medium_position INTEGER,
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

export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tracks');
}
