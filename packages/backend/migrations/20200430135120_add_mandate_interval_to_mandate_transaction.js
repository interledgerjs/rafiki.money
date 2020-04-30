exports.up = function (knex) {
  return knex.schema.table('mandateTransactions', function (table) {
    table.integer('mandateIntervalId').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.table('mandateTransactions', function (table) {
    table.dropColumn('mandateIntervalId')
  })
}
