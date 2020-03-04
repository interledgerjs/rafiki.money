
exports.up = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.string('subject').notNullable()
    table.dateTime('expiresAt')
    table.bigInteger('received').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.table('invoices', function (table) {
    table.dropColumn('subject')
    table.dropColumn('expiresAt')
    table.dropColumn('received')
  })
}
