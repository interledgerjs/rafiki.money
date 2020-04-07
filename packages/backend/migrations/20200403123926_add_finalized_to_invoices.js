
exports.up = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dateTime('finalizedAt')
  })
}

exports.down = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dropColumn('finalizedAt')
  })
}
