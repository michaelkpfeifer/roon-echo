/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('roon_messages', (table) => {
    table.increments('id').primary();
    table.string('message_type').notNullable();
    table.string('sub_type');
    table.timestamp('timestamp').defaultTo(knex.fn.now());
    table.text('message');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('roon_messages');
};
