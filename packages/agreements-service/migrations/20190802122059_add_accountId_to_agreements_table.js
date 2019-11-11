
exports.up = function(knex, Promise) {
  return knex.schema.table('agreements', function (table) {
       table.integer('accountId')
    })
};

exports.down = function(knex) {
  return knex.schema.table('agreements', function(table) {
    table.dropColumn('accountId');
});
};
