import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Server } from 'http'
import { hydra } from './services/hydra'
import * as UsersController from './controllers/userController'
import * as UsersBalanaceController from './controllers/userTotalBalanceController'
import * as UsersPaymentPointerController from './controllers/userDefaultPaymentPointer'
import * as MonetizationBalanceController from './controllers/monetizationBalanceController'
import * as LoginController from './controllers/loginController'
import * as LogoutController from './controllers/logoutController'
import * as ConsentController from './controllers/consentController'
import * as MonetizationController from './controllers/monetizationController'
import * as OpenPaymentsMetadataController from './controllers/openPaymentsMetadataController'
import * as ValidatePaymentPointerController from './controllers/validatePaymentPointerController'
import * as ValidateInvoicesController from './controllers/validateInvoicesController'
import * as Oauth2ClientController from './controllers/oauth2ClientController'
import * as AccountsController from './controllers/accounts'
import * as AccountTransactionsController from './controllers/accountTransactionController'
import * as MandatesController from './controllers/mandatesController'
import * as MandatesTransactionController from './controllers/mandateTransactionsController'
import * as InvoicesController from './controllers/invoicesController'
import * as PeerPaymentController from './controllers/peerPaymentController'
import * as InvoicePaymentController from './controllers/invoicePaymentController'
import * as CancelMandatesController from './controllers/cancelMandatesController'
import * as ChargesController from './controllers/chargesController'
import * as TransactionsController from './controllers/transactionsController'
import { createAuthMiddleware } from './middleware/auth'
import { TokenService } from './services/token-service'
import * as FaucetController from './controllers/faucet'
import { createAttemptAuthMiddleware } from './middleware/attemptAuth'
import { StreamService } from './services/stream'

export interface AppContext extends Context {
  logger: Logger;
  tokenService: TokenService;
  streamService: StreamService;
}

export class App {
  private _koa: Koa<any, AppContext>
  private _publicRouter: Router<any, AppContext>
  private _privateRouter: Router<any, AppContext>
  private _server: Server | undefined

  constructor (logger: Logger, tokenService: TokenService, streamService: StreamService) {
    this._koa = new Koa<any, AppContext>()
    this._koa.context.tokenService = tokenService
    this._koa.context.streamService = streamService
    this._koa.context.logger = logger
    this._privateRouter = new Router<any, AppContext>()
    this._publicRouter = new Router<any, AppContext>()
    this._koa.use(cors())

    this._setupRoutes()

    this._koa.use(bodyParser())
    this._koa.use(this._publicRouter.middleware())
    this._koa.use(this._privateRouter.middleware())
  }

  public listen (port: number | string): void {
    this._server = this._koa.listen(port)
  }

  public shutdown (): void {
    if (this._server) {
      this._server.close()
    }
  }

  public getPort (): number {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return this._server.address().port
  }

  private _setupRoutes (): void {
    this._privateRouter.use(createAuthMiddleware(hydra))
    this._publicRouter.use(createAttemptAuthMiddleware(hydra))

    this._publicRouter.get('/healthz', (ctx: AppContext) => {
      ctx.status = 200
    })

    this._publicRouter.post('/users', UsersController.store)
    this._privateRouter.patch('/users/:id', UsersController.update)

    this._privateRouter.get('/users/me', UsersController.show)
    this._privateRouter.get('/users/me/balance', UsersBalanaceController.show)
    this._privateRouter.get('/users/me/paymentpointer', UsersPaymentPointerController.show)
    this._privateRouter.get('/users/me/monetizationbalance', MonetizationBalanceController.show)

    this._publicRouter.get('/login', LoginController.show)
    this._publicRouter.post('/login', LoginController.store)
    this._publicRouter.get('/consent', ConsentController.show)
    this._publicRouter.post('/consent', ConsentController.store)

    this._publicRouter.post('/logout', LogoutController.store)

    this._publicRouter.get('/p/:username', MonetizationController.show)
    this._publicRouter.get('/.well-known/open-payments', OpenPaymentsMetadataController.show)

    this._publicRouter.get('/paymentpointers/validate', ValidatePaymentPointerController.show)
    this._publicRouter.get('/validate/invoices', ValidateInvoicesController.show)

    this._privateRouter.post('/oauth2/clients', Oauth2ClientController.store)

    this._privateRouter.get('/accounts/:id', AccountsController.show)
    this._privateRouter.get('/accounts', AccountsController.index)
    this._privateRouter.post('/accounts', AccountsController.create)
    this._privateRouter.patch('/accounts/:id', AccountsController.update)

    this._privateRouter.get('/accounts/:id/transactions', AccountTransactionsController.index)

    this._privateRouter.post('/faucet', FaucetController.create)

    this._privateRouter.get('/transactions', TransactionsController.index)
    this._privateRouter.post('/transactions', TransactionsController.store)

    this._publicRouter.post('/mandates', MandatesController.store)
    this._privateRouter.get('/mandates', MandatesController.index)
    this._privateRouter.get('/mandates/:id', MandatesController.show)
    this._privateRouter.put('/mandates/:id/cancel', CancelMandatesController.store)
    this._privateRouter.post('/mandates/:id/charges', ChargesController.store)
    this._privateRouter.get('/mandates/:id/transactions', MandatesTransactionController.index)

    this._publicRouter.post('/invoices', InvoicesController.store)
    this._publicRouter.get('/invoices/:id', InvoicesController.show)
    this._publicRouter.options('/invoices/:id', InvoicesController.options)

    this._privateRouter.post('/payments/peer', PeerPaymentController.store)
    this._privateRouter.post('/payments/invoice', InvoicePaymentController.store)
  }
}
