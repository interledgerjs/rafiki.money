
exports.up = function (knex, Promise) {
    return knex.schema
        .createTable('signupSessions', function (table) {
            table.string('id').unique().primary().notNullable()
            table.string('userId').unique().notNullable()
            table.bigInteger('expiresAt').notNullable()
        })
}

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('signupSessions')
}
