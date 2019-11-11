
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('agreements', function (table) {
       table.uuid('id').primary()
       table.integer('userId')
       table.string('assetCode').notNullable()
       table.integer('assetScale').notNullable()
       table.string('amount')
       table.integer('start')
       table.integer('expiry')
       table.string('interval')
       table.boolean('cap')
       table.integer('createdAt').notNullable()
       table.integer('updatedAt')
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
      .dropTableIfExists("agreements")
};
