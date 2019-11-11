
exports.up = function (knex) {
  return knex.schema.createTable('transactions', (t) => {
    t.increments('id').unsigned().primary()
    t.string('accountId').notNullable()
    t.string('amount').notNullable()
    t.bigInteger('epoch').unsigned().notNullable()
    t.text('Description')
    t.timestamps(true, true)
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('transactions')
}
