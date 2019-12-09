exports.up = function(knex) {
  return knex.schema.table('agreements', function(table) {
    table.integer('cancelledAt')
  })
}

exports.down = function(knex) {
  return knex.schema.table('agreements', function(table) {
    table.dropColumn('cancelledAt')
  })
}
