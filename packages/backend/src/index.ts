import createLogger from 'pino'
import { App } from './app'
import { Model } from 'objection'
import { TokenService } from './services/token-service'
import { StreamService } from './services/stream'
import BtpPlugin from 'ilp-plugin-btp'
import { randomBytes } from 'crypto'
import { run } from './jobs/claimInvoicesJob'
import Knex = require('knex')
const logger = createLogger()
logger.level = process.env.LOG_LEVEL || 'info'

const PORT = process.env.PORT || 3001
const POSTGRES_CONNECTION = process.env.POSTGRES_CONNECTION || 'postgresql://postgres:password@localhost:5432/development'

const knex = Knex({
  client: 'postgresql',
  connection: POSTGRES_CONNECTION,
  pool: {
    min: 2,
    max: 10
  }
})

const plugin = new BtpPlugin({
  server: process.env.BTP_UPLINK || 'btp+ws://localhost:8000',
  btpToken: randomBytes(4).toString()
})

const streamService = new StreamService({
  key: process.env.STREAM_KEY || '716343aed8ac20ef1853e04c11ed9a0e',
  logger: logger,
  plugin: plugin
})

const tokenService = new TokenService({
  clientId: process.env.OAUTH_CLIENT_ID || 'wallet-users-service',
  clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
  tokenRefreshTime: 0
})

let claimInvoiceInterval: NodeJS.Timeout

const app = new App(logger, tokenService, streamService)

export const gracefulShutdown = async (): Promise<void> => {
  logger.info('shutting down.')
  clearInterval(claimInvoiceInterval)
  app.shutdown()
  await knex.destroy()
  await streamService.close()
  await plugin.disconnect()
}

export const start = async (): Promise<void> => {
  let shuttingDown = false
  process.on('SIGINT', async (): Promise<void> => {
    try {
      if (shuttingDown) {
        logger.warn('received second SIGINT during graceful shutdown, exiting forcefully.')
        process.exit(1)
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

  logger.info('Migrating')
  await knex.migrate.latest()
  logger.info('Migration Finished')
  Model.knex(knex)

  logger.info('Listening on STREAM')
  await streamService.listen()
  logger.info('STREAM Listening')
  claimInvoiceInterval = run()
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
