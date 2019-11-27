exports.up = function(knex) {
  return knex.schema.table('agreements', function(table) {
    table.integer('cancelled')
  })
}

exports.down = function(knex) {
  return knex.schema.table('agreements', function(table) {
    table.dropColumn('cancelled')
  })
}
