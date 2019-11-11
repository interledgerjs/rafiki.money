import createLogger from 'pino'
import { createApp } from './app'
import { TokenService } from './services/token-service'
import { AgreementsService } from './services/agreements'
import { StreamService } from './services/stream'
import { hydraApi } from './apis/hydra'
import { Server } from 'http'
import { extend } from 'got'

const logger = createLogger()
logger.level = process.env.LOG_LEVEL || 'info'

const PORT = process.env.PORT || 3000

const tokenService = new TokenService({
  clientId: process.env.OAUTH_CLIENT_ID || 'wallet-stream-service',
  clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
  tokenRefreshTime: 0
})

const agreementClient = extend({
  baseUrl: 'https://rafiki.money/api',
  json: true
})

const agreementsService = new AgreementsService(agreementClient)
const streamService = new StreamService(tokenService)

const app = createApp({
  logger,
  agreementsService,
  streamService,
  hydraApi
})

let server: Server
export const gracefulShutdown = async (): Promise<void> => {
  logger.info('shutting down.')
  if (server) {
    await server.close()
  }
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

  server = app.listen(PORT)
  logger.info(`Listening on ${PORT}`)
}

// If this script is run directly, start the server
if (!module.parent) {
  start().catch(e => {
    const errInfo = (e && typeof e === 'object' && e.stack) ? e.stack : e
    logger.error(errInfo)
  })
}
