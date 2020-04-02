import Knex from 'knex'
import { App } from '../../src/app'
import createLogger from 'pino'
import { TokenService } from '../../src/services/token-service'
import { Model } from 'objection'
import { StreamService } from '../../src/services/stream'
import MockPlugin from '../mocks/plugin'
const knexConfig = require('../../knexfile') // eslint-disable-line @typescript-eslint/no-var-requires

export type TestAppContainer = {
  port: number,
  app: App,
  knex: Knex,
  streamService: StreamService
}

export const createTestApp = (): TestAppContainer => {
  const logger = createLogger()
  const knex = Knex({
    ...knexConfig.testing
  })
  const serverPlugin = new MockPlugin()
  const streamService = new StreamService({
    key: '716343aed8ac20ef1853e04c11ed9a0e',
    logger: logger,
    plugin: serverPlugin as any
  })

  // node pg defaults to returning bigint as string. This ensures it parses to bigint
  knex.client.driver.types.setTypeParser(20, 'text', BigInt)

  const app = new App(logger, {} as TokenService, streamService)

  Model.knex(knex)

  streamService.listen()

  app.listen(0)

  return {
    app,
    knex,
    port: app.getPort(),
    streamService
  }
}
