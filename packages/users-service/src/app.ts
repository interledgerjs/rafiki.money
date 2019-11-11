import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import createRouter, { Router } from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Server } from 'http'
import { hydra, TokenInfo } from './services/hydra'
import * as UsersController from './controllers/userController'
import * as LoginController from './controllers/loginController'
import * as ConsentController from './controllers/consentController'
import * as PaymentPointerController from './controllers/payment-pointer'
import * as Oauth2ClientController from './controllers/oauth2ClientController'
import { createAuthMiddleware } from './middleware/auth'
import { TokenService } from './services/token-service'

export type AppContext<T = any> = Koa.ParameterizedContext<T, { logger: Logger; tokenService: TokenService }>

export class App {
  private _koa: Koa
  private _router: Router
  private _server: Server

  constructor (logger: Logger, tokenService: TokenService) {
    this._koa = new Koa<any, AppContext>()
    this._koa.context.tokenService = tokenService
    this._koa.context.logger = logger
    this._router = createRouter()
    this._koa.use(cors())
    this._setupRoutes()
    this._koa.use(bodyParser())
    this._koa.use(this._router.middleware())
  }

  public listen (port: number | string): void {
    this._server = this._koa.listen(port)
  }

  public shutdown (): void {
    if (this._server) {
      this._server.close()
    }
  }

  private _setupRoutes (): void {
    this._router.post('/users', UsersController.createValidation(), UsersController.store)
    this._router.patch('/users/:id', UsersController.update)
    this._router.get('/users/me', [createAuthMiddleware(hydra), UsersController.show])

    this._router.get('/login', LoginController.getValidation(), LoginController.show)
    this._router.post('/login', LoginController.createValidation(), LoginController.store)

    this._router.get('/consent', ConsentController.getValidation(), ConsentController.show)
    this._router.post('/consent', ConsentController.storeValidation(), ConsentController.store)

    this._router.get('/p/:username', PaymentPointerController.show)

    this._router.post('/oauth2/clients', Oauth2ClientController.createValidation(), Oauth2ClientController.store)
  }
}
