
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('charges', function (table) {
      table.uuid('id').primary()
      table.string('mandateId').notNullable()
      table.string('invoice').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("charges")
};
