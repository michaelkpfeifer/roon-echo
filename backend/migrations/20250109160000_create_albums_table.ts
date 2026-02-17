import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE albums (
      roon_album_id TEXT NOT NULL CHECK (length(roon_album_id) = 36),
      roon_album_name TEXT NOT NULL,
      roon_album_artist_name TEXT NOT NULL,
      mb_candidates_fetched_at DATETIME,
      mb_candidates_matched_at DATETIME,
      mb_album_id TEXT CHECK (length(mb_album_id) = 36),
      mb_album_name TEXT,
      mb_score INTEGER,
      mb_track_count INTEGER,
      mb_release_date
      created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (roon_album_id)
    )
  `);

  await knex.raw(`
  CREATE UNIQUE INDEX albums_roon_album_name_roon_album_artist_name_unique
    ON albums (roon_album_name, roon_album_artist_name);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('albums');
}
