
exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('defaultAccountId').nullable()
  })
}

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('defaultAccountId')
  })
}
