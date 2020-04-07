
exports.up = function (knex) {
  return knex.schema.createTable('mandateTransactions', (t) => {
    t.increments('id').unsigned().primary()
    t.integer('accountId').notNullable()
    t.string('chargeId').nullable()
    t.bigInteger('amount').notNullable()
    t.text('description')
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
    t.uuid('mandateId').notNullable();
  })
};

exports.down = function (knex) {
  return knex.schema.dropTable('mandateTransactions')
};
