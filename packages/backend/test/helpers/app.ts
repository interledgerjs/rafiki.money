import Knex from 'knex'
import { App } from '../../src/app'
import createLogger from 'pino'
import { TokenService } from '../../src/services/token-service'
import { Model } from 'objection'
const knexConfig = require('../../knexfile') // eslint-disable-line @typescript-eslint/no-var-requires

export type TestAppContainer = {
  port: number,
  app: App,
  knex: Knex,
}

export const createTestApp = (): TestAppContainer => {
  const logger = createLogger()
  const knex = Knex({
    ...knexConfig.testing
  })

  // node pg defaults to returning bigint as string. This ensures it parses to bigint
  knex.client.driver.types.setTypeParser(20, 'text', BigInt)

  const app = new App(logger, {} as TokenService)

  Model.knex(knex)

  app.listen(0)

  return {
    app,
    knex,
    port: app.getPort()
  }
}
