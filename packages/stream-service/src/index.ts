import createLogger from 'pino'
import { App } from './app'
import { Server as StreamServer } from 'ilp-protocol-stream'
import BtpPlugin from 'ilp-plugin-btp'
import { randomBytes } from 'crypto'
const logger = createLogger()
logger.level = process.env.LOG_LEVEL || 'info'

const PORT = process.env.PORT || 3001
const BTP_UPLINK = process.env.BTP_UPLINK || 'btp+ws://:secret@localhost:7770/accounts/stream/ilp/btp'

const client = new BtpPlugin({
  server: BTP_UPLINK
})

const streamServer = new StreamServer({
  plugin: client,
  serverSecret: randomBytes(32)
})

const app = new App(logger, streamServer)

export const gracefulShutdown = async (): Promise<void> => {
  logger.info('shutting down.')
  await streamServer.close()
  app.shutdown()
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

  await streamServer.listen()
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
