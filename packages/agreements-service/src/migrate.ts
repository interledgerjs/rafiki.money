import Knex from 'knex'

const DATABASE_CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING || ':memory:'
const knex: Knex = Knex(DATABASE_CONNECTION_STRING)

const start = async (): Promise<void> => {
  console.log('Migrating Database')
  await knex.migrate.latest()
  console.log('Finished migrating Database')
  await knex.destroy()
}

start().catch(error => {
  console.log('error running migration', error)
})
