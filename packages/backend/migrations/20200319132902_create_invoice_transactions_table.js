
exports.up = function (knex) {
  return knex.schema.createTable('invoiceTransactions', (t) => {
    t.increments('id')
    t.string('invoiceId')
    t.bigInteger('amount').notNullable()
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('invoiceTransactions')
}
