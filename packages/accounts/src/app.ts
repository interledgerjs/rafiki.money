import { KnexAccountService } from './services/accounts-service'
import { Logger } from 'pino'
import { KnexTransactionService } from './services/transactions-service'
import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { create as createFaucet } from './controllers/faucet'
import { create as createTransaction, index as indexTransactions } from './controllers/transactions'
import { create as createAccount, update as updateAccount, show as showAccount, index as indexAccount } from './controllers/accounts'
import { AccountsAppContext } from './index'
import { HydraApi } from './apis/hydra'
import { createAuthMiddleware } from './middleware/auth'
import cors from '@koa/cors'

export type AppConfig = {
  logger: Logger;
  accountsService: KnexAccountService;
  transactionsService: KnexTransactionService;
  hydraApi: HydraApi;
}

export function createApp (appConfig: AppConfig): Koa {
  const app = new Koa<any, AccountsAppContext>()
  const privateRouter = new Router<any, AccountsAppContext>()
  const publicRouter = new Router<any, AccountsAppContext>()

  app.use(cors())
  app.use(bodyParser())
  app.use(async (ctx, next) => {
    ctx.accounts = appConfig.accountsService
    ctx.transactions = appConfig.transactionsService
    ctx.logger = appConfig.logger
    await next()
  })

  // Health Endpoint
  publicRouter.get('/', (ctx) => {
    ctx.status = 200
  })

  privateRouter.use(createAuthMiddleware(appConfig.hydraApi))
  privateRouter.get('/accounts/:id', showAccount)
  privateRouter.get('/accounts', indexAccount)
  privateRouter.post('/accounts', createAccount)
  privateRouter.patch('/accounts/:id', updateAccount)
  privateRouter.delete('/accounts/:id', createAccount)

  privateRouter.get('/transactions', indexTransactions)
  privateRouter.post('/transactions', createTransaction)

  privateRouter.post('/faucet', createFaucet)

  app.use(publicRouter.routes())
  app.use(privateRouter.routes())

  return app
}
