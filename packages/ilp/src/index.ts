import { config } from 'dotenv'
import { Server } from 'http'
import createLogger from 'pino'
import { WalletPeersService } from './services/peers-service'
import { WalletAccountsService } from './services/accounts-service'
import axios, { AxiosInstance } from 'axios'
import { FxService } from './services/fx-service'
import { randomBytes } from 'crypto'
import { TokenService } from './services/token-service'
import { AgreementsService } from './services/agreements-service'
import { createApp } from './app'
import { hydraIntrospection } from './services/auth'

config()
const logger = createLogger()
logger.level = process.env.LOG_LEVEL || 'info'

/**
 * Connector variables
 */
const PREFIX = process.env.PREFIX || 'test'
// const ILP_ADDRESS = process.env.ILP_ADDRESS || undefined //If undefined do ILDCP on uplink?
const ILP_ADDRESS = process.env.ILP_ADDRESS || 'test.wallet'
const ILP_STREAM_SUBADDRESS = ILP_ADDRESS + '.stream'
const PORT = parseInt(process.env.PORT || '3000', 10)
const UPLINK_AUTH_TOKEN = process.env.UPLINK_AUTH_TOKEN || ''
const UPLINK_URL = process.env.UPLINK_URL || ''

const STREAM_SERVER_SECRET = process.env.STREAM_SERVER_SECRET ? Buffer.from(process.env.STREAM_SERVER_SECRET, 'hex') : randomBytes(32)

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'wallet-ilp-service'
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'secret'

const tokenService = new TokenService({
  clientId: OAUTH_CLIENT_ID,
  clientSecret: OAUTH_CLIENT_SECRET,
  issuerUrl: 'https://auth.rafiki.money',
  tokenRefreshTime: 30
})

const AGREEMENT_API_URL = process.env.AGREEMENT_API_URL || ''
const agreementClient: AxiosInstance = axios.create({
  baseURL: AGREEMENT_API_URL,
  timeout: 3000
})

const ACCOUNTS_API_URL = process.env.ACCOUNTS_API_URL || ''
const accountsClient: AxiosInstance = axios.create({
  baseURL: ACCOUNTS_API_URL,
  timeout: 3000
})

accountsClient.interceptors.request.use(async (config) => {
  const token = await tokenService.getAccessToken()
  config.headers.Authorization = 'Bearer ' + token
  return config
})

const FX_API_URL = 'https://min-api.cryptocompare.com'
const fxClient: AxiosInstance = axios.create({
  baseURL: FX_API_URL,
  timeout: 1000
})

if (!ILP_ADDRESS) {
  throw new Error('ILP Address must be defined')
}

const peersService = new WalletPeersService('uplink', UPLINK_URL, UPLINK_AUTH_TOKEN)
const accountsService = new WalletAccountsService(accountsClient)
const fxService = new FxService({
  fxClient,
  defaultCacheTime: 5000
})
const agreementsService = new AgreementsService(agreementClient)
const introspection = hydraIntrospection

const app = createApp({
  logger,
  peersService,
  accountsService,
  agreementsService,
  fxService,
  introspection,
  ilpAddress: ILP_ADDRESS,
  ilpStreamSubAddress: ILP_STREAM_SUBADDRESS,
  prefix: PREFIX,
  streamServerSecret: STREAM_SERVER_SECRET
})

let server: Server

export const gracefulShutdown = async (): Promise<void> => {
  logger.info('shutting down.')
  if (server) {
    return new Promise((resolve, reject): void => {
      server.close((err?: Error) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
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

  logger.info('🚀 the 🐒')
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
