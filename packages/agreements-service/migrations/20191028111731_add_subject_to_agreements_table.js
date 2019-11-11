
exports.up = function (knex) {
  return knex.schema.table('agreements', function (t) {
    t.string('subject')
  })
}

exports.down = function (knex) {
  return knex.schema.table('agreements', function (t) {
    t.dropColumn('subject')
  })
}
