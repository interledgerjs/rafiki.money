import Koa, { Context } from 'koa'
import { Logger } from 'pino'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Server } from 'http'
import { Server as StreamServer } from 'ilp-protocol-stream'
import * as CredentialsController from './controllers/credentials'
import { ConnectionTag } from './services/connectionTag'

export interface AppContext extends Context {
  logger: Logger;
  stream: StreamServer;
  connectionTag: ConnectionTag
}

export class App {
  private _koa: Koa<any, AppContext>
  private _publicRouter: Router<any, AppContext>
  private _server: Server | undefined

  constructor (logger: Logger, streamServer: StreamServer) {
    this._koa = new Koa<any, AppContext>()
    this._koa.context.logger = logger
    this._koa.context.stream = streamServer
    this._koa.context.connectionTag = new ConnectionTag('716343aed8ac20ef1853e04c11ed9a0e')
    this._publicRouter = new Router<any, AppContext>()
    this._koa.use(cors())

    this._setupRoutes()

    this._koa.use(bodyParser())
    this._koa.use(this._publicRouter.middleware())
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
    this._publicRouter.use()

    this._publicRouter.get('/healthz', (ctx: AppContext) => {
      ctx.status = 200
    })

    this._publicRouter.post('/credentials', CredentialsController.create)
  }
}
