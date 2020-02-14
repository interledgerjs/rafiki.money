
exports.up = function (knex) {
  return knex.schema
    .createTable('invoices', function (table) {
      table.uuid('id').primary()
      table.integer('userId')
      table.integer('accountId')
      table.text('description')
      table.string('assetCode').notNullable()
      table.integer('assetScale').notNullable()
      table.bigInteger('amount').notNullable()
      table.bigInteger('balance').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("invoices")
};
