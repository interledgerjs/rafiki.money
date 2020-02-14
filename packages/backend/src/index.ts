import createLogger from 'pino'
import { App } from './app'
import { Model } from 'objection'
import { TokenService } from './services/token-service'
import Knex = require('knex')
const logger = createLogger()
logger.level = process.env.LOG_LEVEL || 'info'

const PORT = process.env.PORT || 3001

const knex = Knex({
  client: 'postgresql',
  connection: {
    user: 'postgres',
    password: 'password',
    database: 'development'
  },
  pool: {
    min: 2,
    max: 10
  }
})

const tokenService = new TokenService({
  clientId: process.env.OAUTH_CLIENT_ID || 'wallet-users-service',
  clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
  tokenRefreshTime: 0
})

const app = new App(logger, tokenService)

export const gracefulShutdown = async (): Promise<void> => {
  logger.info('shutting down.')
  app.shutdown()
  await knex.destroy()
}

export const start = async (): Promise<void> => {
  let shuttingDown = false
  process.on('SIGINT', async (): Promise<void> => {
    try {
      if (shuttingDown) {
        logger.warn('received second SIGINT during graceful shutdown, exiting forcefully.')
        process.exit(1)
        return
      }

      shuttingDown = true

      // Graceful shutdown
      await gracefulShutdown()
      logger.info('completed graceful shutdown.')
    } catch (err) {
      const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err
      logger.error('error while shutting down. error=%s', errInfo)
      process.exit(1)
    }
  })

  // Do migrations
  await knex.migrate.latest()
  Model.knex(knex)

  app.listen(PORT)
  logger.info(`Listening on ${PORT}`)
}

// If this script is run directly, start the server
if (!module.parent) {
  start().catch(e => {
    const errInfo = (e && typeof e === 'object' && e.stack) ? e.stack : e
    logger.error(errInfo)
  })
}
