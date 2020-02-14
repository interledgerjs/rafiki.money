import Knex from 'knex'
import { Model } from 'objection'
const knexConfig = require('../../knexfile') // eslint-disable-line @typescript-eslint/no-var-requires

export const refreshDatabase = async (): Promise<Knex> => {
  const knex = Knex({
    ...knexConfig.testing
  })

  // Create or migrate:
  await knex.migrate.rollback(knexConfig, true)
  await knex.migrate.latest()

  // // Bind all Models to a knex instance. If you only have one database in
  // // your server this is all you have to do. For multi database systems, see
  // // the Model.bindKnex method.
  Model.knex(knex)

  return knex
}
