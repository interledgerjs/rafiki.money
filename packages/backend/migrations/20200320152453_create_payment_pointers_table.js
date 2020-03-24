
exports.up = function(knex) {
  return knex.schema.createTable('paymentPointers', (t) => {
    t.increments('id')
    t.string('name').notNullable()
    t.string('identifier').unique()
    t.integer('userId').notNullable()
    t.integer('accountId')
    t.integer('currentMonetizationInvoiceId')
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('paymentPointers')
};
