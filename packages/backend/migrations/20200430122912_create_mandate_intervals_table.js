
exports.up = function (knex) {
  return knex.schema.createTable('mandateIntervals', (t) => {
    t.increments('id').unsigned().primary()
    t.uuid('mandateId').notNullable();
    t.timestamp('startAt').notNullable();
    t.bigInteger('used').notNullable();
    t.timestamp('createdAt').defaultTo(knex.fn.now());
    t.timestamp('updatedAt').defaultTo(knex.fn.now());
    t.unique(['mandateId', 'startAt'])
  })
};

exports.down = function (knex) {
  return knex.schema.dropTable('mandateIntervals')
};
