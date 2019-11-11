
exports.up = function(knex) {
  return knex.schema.table('agreements', function(t) {
    t.string('scope');
    t.string('secret');
    t.string('secretSalt');
    t.string('callback');
    t.string('type');
});
};

exports.down = function(knex) {
  return knex.schema.table('agreements', function(t) {
    t.dropColumn('scope');
    t.dropColumn('secret');
    t.dropColumn('secretSalt');
    t.dropColumn('callback');
    t.dropColumn('type');
});
};
