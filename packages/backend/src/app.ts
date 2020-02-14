import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Server } from 'http'
import { hydra } from './services/hydra'
import * as UsersController from './controllers/userController'
import * as LoginController from './controllers/loginController'
import * as LogoutController from './controllers/logoutController'
import * as ConsentController from './controllers/consentController'
import * as PaymentPointerController from './controllers/payment-pointer'
import * as Oauth2ClientController from './controllers/oauth2ClientController'
import * as AccountsController from './controllers/accounts'
import * as MandatesController from './controllers/mandatesController'
import * as InvoicesController from './controllers/invoicesController'
import * as CancelMandatesController from './controllers/cancelMandatesController'
import { createAuthMiddleware } from './middleware/auth'
import { TokenService } from './services/token-service'
import * as FaucetController from './controllers/faucet'
import { createAttemptAuthMiddleware } from './middleware/attemptAuth'

export interface AppContext extends Context {
  logger: Logger;
}

export class App {
  private _koa: Koa<any, AppContext>
  private _publicRouter: Router<any, AppContext>
  private _privateRouter: Router<any, AppContext>
  private _server: Server | undefined

  constructor (logger: Logger, tokenService: TokenService) {
    this._koa = new Koa<any, AppContext>()
    this._koa.context.tokenService = tokenService
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

    this._publicRouter.get('/login', LoginController.show)
    this._publicRouter.post('/login', LoginController.store)
    this._publicRouter.get('/consent', ConsentController.show)
    this._publicRouter.post('/consent', ConsentController.store)

    this._publicRouter.post('/logout', LogoutController.store)

    this._publicRouter.get('/p/:username', PaymentPointerController.show)

    this._privateRouter.post('/oauth2/clients', Oauth2ClientController.store)

    this._privateRouter.get('/accounts/:id', AccountsController.show)
    this._privateRouter.get('/accounts', AccountsController.index)
    this._privateRouter.post('/accounts', AccountsController.create)
    this._privateRouter.patch('/accounts/:id', AccountsController.update)

    this._privateRouter.post('/faucet', FaucetController.create)

    this._publicRouter.post('/mandates', MandatesController.store)
    this._privateRouter.get('/mandates', MandatesController.index)
    this._privateRouter.get('/mandates/:id', MandatesController.show)
    this._privateRouter.put('/mandates/:id/cancel', CancelMandatesController.store)

    this._privateRouter.post('/invoices', InvoicesController.store)
    this._publicRouter.get('/invoices/:id', InvoicesController.show)
  }
}
