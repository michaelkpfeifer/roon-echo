/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('mb_albums', (table) => {
    table.text('mb_album_id').notNullable().primary();
    table
      .integer('roon_album_id')
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
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('mb_albums');
}
