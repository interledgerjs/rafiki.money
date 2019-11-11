
exports.up = function (knex) {
  return knex.schema.createTable('accounts', (t) => {
    t.increments('id').unsigned().primary()
    t.string('userId').notNullable()
    t.string('name').notNullable()
    t.string('assetCode').notNullable()
    t.integer('assetScale').notNullable()
    t.string('balance').notNullable()
    t.string('limit').notNullable()
    t.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('accounts')
}
