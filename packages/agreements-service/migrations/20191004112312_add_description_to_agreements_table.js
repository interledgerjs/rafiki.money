
exports.up = function (knex) {
  return knex.schema.table('agreements', function (t) {
    t.string('description')
  })
}

exports.down = function (knex) {
  return knex.schema.table('agreements', function (t) {
    t.dropColumn('description')
  })
}
