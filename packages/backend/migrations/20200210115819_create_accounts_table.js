
exports.up = function (knex) {
  return knex.schema.createTable('accounts', (t) => {
    t.increments('id').unsigned().primary()
    t.integer('userId').notNullable()
    t.string('name').notNullable()
    t.string('assetCode').notNullable()
    t.integer('assetScale').notNullable()
    t.bigInteger('balance').notNullable().defaultTo(0n)
    t.bigInteger('limit').notNullable()
    t.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('accounts')
}
