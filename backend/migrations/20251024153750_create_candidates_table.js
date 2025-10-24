/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('candidates', (table) => {
    table.uuid('mb_album_id').notNullable();
    table
      .uuid('roon_album_id')
      .notNullable()
      .references('id')
      .inTable('roon_albums')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.text('type').notNullable();
    table.integer('score');
    table.integer('candidate_priority');
    table.integer('track_count');
    table.text('mb_release_date');

    table.timestamps(true, true);

    table.primary(['roon_album_id', 'mb_album_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('candidates');
}
