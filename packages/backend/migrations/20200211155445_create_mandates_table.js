
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('mandates', function (table) {
      table.uuid('id').primary()
      table.integer('userId')
      table.integer('accountId')
      table.text('description')
      table.string('assetCode').notNullable()
      table.integer('assetScale').notNullable()
      table.bigInteger('amount').notNullable()
      table.bigInteger('balance').notNullable()
      table.dateTime('startAt')
      table.dateTime('expireAt')
      table.string('interval')
      table.boolean('cap')
      table.string('scope')
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
      table.dateTime('cancelledAt')
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists("mandates")
};
