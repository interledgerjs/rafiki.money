import {
  AccountsService,
  createAuthMiddleware,
  createIncomingBalanceMiddleware,
  createIncomingErrorHandlerMiddleware, createOutgoingBalanceMiddleware,
  createOutgoingExpireMiddleware, PeersService, Rafiki, RafikiContext, RafikiState
} from '@interledger/rafiki-core'
import {
  createIncomingMaxPacketAmountMiddleware,
  createIncomingRateLimitMiddleware,
  createIncomingThroughputMiddleware,
  createOutgoingReduceExpiryMiddleware,
  createOutgoingThroughputMiddleware, createOutgoingValidateFulfillmentMiddleware
} from '@interledger/rafiki-middleware'
import { createIncomingAgreementsMiddleware } from './middleware/agreements'
import { createIncomingAgreementFXMiddleware } from './middleware/agreement-fx'
import { createOutgoingStreamReceiverMiddleware } from './middleware/stream-reciever'
import { Agreement } from './types/agreement'
import Router from '@koa/router'
import { Context } from 'koa'
import { Logger } from 'pino'
import { AgreementsServiceInterface } from './services/agreements-service'
import { WalletRouter } from './services/router'
import { IntrospectFunction } from './services/auth'
import { FxServiceInterface } from './services/fx-service'
import { createIldcpProtocolController } from './controllers/ildcp'
import { createSendController } from './controllers/send'
import cors from '@koa/cors'
import compose = require('koa-compose')

export interface AppConfig {
  logger: Logger;
  agreementsService: AgreementsServiceInterface;
  accountsService: AccountsService;
  peersService: PeersService;
  fxService: FxServiceInterface;
  ilpAddress: string;
  ilpStreamSubAddress: string;
  streamServerSecret: Buffer;
  prefix: string;
  introspection: IntrospectFunction;
}

export type RafikiWalletState = RafikiState<{ agreement?: Agreement; incomingAccountId: string }>

export function createApp (config: AppConfig): Rafiki {
  // TODO we probably don't even need this
  const router = new WalletRouter(config.ilpAddress, 'uplink')

  const incoming = compose([
    // Incoming Rules
    createIncomingErrorHandlerMiddleware(),
    createIncomingAgreementsMiddleware(config.agreementsService),
    createIncomingAgreementFXMiddleware(config.fxService),
    createIncomingMaxPacketAmountMiddleware(),
    createIncomingRateLimitMiddleware(),
    createIncomingThroughputMiddleware(),
    createIncomingBalanceMiddleware()
  ])

  const outgoing = compose([
    // Outgoing Rules
    createIncomingErrorHandlerMiddleware(),
    createOutgoingThroughputMiddleware(),
    createOutgoingReduceExpiryMiddleware(),
    createOutgoingExpireMiddleware(),
    createOutgoingBalanceMiddleware(),
    // createOutgoingIntentsMiddleware(config.ilpAddress),
    createOutgoingStreamReceiverMiddleware(config.ilpStreamSubAddress, config.streamServerSecret),
    createOutgoingValidateFulfillmentMiddleware(),
    // Send outgoing packets
    createSendController()
  ])

  const middleware = compose([incoming, outgoing])

  const app = new Rafiki<RafikiWalletState>({
    peers: config.peersService,
    router: router,
    accounts: config.accountsService,
    logger: config.logger
  })

  app.use(cors())

  // TODO this is needed as Rafiki enforces needing this header whilst our uplink connector doesn't
  app.use(async (ctx, next) => {
    const headers = ctx.request.header
    headers['content-type'] = 'application/octet-stream'
    ctx.request.headers = headers
    await next()
  })

  app.use(createAuthMiddleware({ introspect: config.introspection }))

  const URLRouter = new Router()

  // Accounts specific Route
  URLRouter.post('/accounts/:accountId/ilp', async (ctx: Context, next: () => Promise<void>) => {
    // TODO this is less NB

    await next()
  })

  // Agreements specific Route
  URLRouter.post('/agreements/:agreementId/ilp', async (ctx: Context, next: () => Promise<void>) => {
    const { agreementId } = ctx.params

    if (agreementId) {
      config.logger.trace('Got an agreement scoped request', { agreementId })
      try {
        const agreement = await config.agreementsService.getAgreement(agreementId)
        config.logger.trace('Found agreement', { agreement })
        ctx.state.agreement = agreement
        ctx.state.incomingAccountId = agreement.accountId
        if (ctx.state.user && agreement) {
          const isAuthed = String(ctx.state.user.sub) === String(agreement.userId) || String(ctx.state.user.sub) === String(agreement.subject)
          config.logger.trace('Agreement token comparison', { isAuthed, userId: agreement.userId, sub: ctx.state.user.sub, agreementSubject: agreement.subject })
          ctx.assert(isAuthed, 403)
        }
      } catch (error) {
        config.logger.error('Error trying to get the agreement', { error })
        return
      }
    }
    await next()
  })

  // Uplink Specific Route
  URLRouter.post('/uplink/ilp', async (ctx: Context, next: () => Promise<void>) => {
    ctx.assert(ctx.state.user.sub === 'uplink', 403)

    config.logger.info('Uplink', {
      state: ctx.state
    })
    ctx.state.incomingAccountId = 'uplink'

    await next()
  })

  app.use(URLRouter.routes())

  app.useIlp({
    getIncomingAccountId: (ctx: RafikiContext<RafikiWalletState>): Promise<string> => {
      const accountId = ctx.state.incomingAccountId
      if (!accountId) { throw new Error('AccountId not found') }

      ctx.services.logger.debug('AccountId for request used is', {
        accountId
      })
      return Promise.resolve(accountId)
    },
    getOutgoingAccountId: async (ctx: RafikiContext<RafikiWalletState>) => {
      const { destination } = ctx.request.prepare

      if (destination.startsWith(config.ilpStreamSubAddress)) {
        const { destination } = ctx.request.prepare
        const localAddressParts = destination.replace(config.ilpStreamSubAddress + '.', '').split('.')
        const accountId = localAddressParts[0]
        ctx.services.logger.debug('Got stream destination, setting outing accountId to stream accountId', {
          destination,
          accountId: accountId
        })
        return accountId
      }

      if (destination.startsWith(config.ilpAddress + '.agreements')) {
        const { destination } = ctx.request.prepare
        const addressParts = destination.replace(config.ilpAddress + '.agreements.', '').split('.')
        const agreementId = addressParts[0]
        ctx.services.logger.debug('Got agreements destination, setting outing accountId to stream accountId', {
          destination,
          agreementId: agreementId
        })
        const agreement = await config.agreementsService.getAgreement(agreementId)
        ctx.state.agreement = agreement
        return agreement.accountId
      }

      if (ctx.state.incomingAccountId === 'uplink') {
        throw new Error('Cant have incoming and outgoing as uplink')
      }

      ctx.services.logger.debug('Setting outgoing account to uplink', {
        destination
      })
      return 'uplink'
    }
  })

  // TODO Using a cruder router for now as I think the routers conflict.
  app.use(async (ctx, next) => {
    const { destination } = ctx.request.prepare
    if (destination.startsWith(config.prefix)) {
      await middleware(ctx, next)
    }
    await next()
  })

  const ildcpController = createIldcpProtocolController(config.ilpAddress)
  app.use(async (ctx, next) => {
    const { destination } = ctx.request.prepare
    if (destination.startsWith('peer.config')) {
      await ildcpController(ctx)
    }
    await next()
  })

  return app
}
