import Koa, { Context } from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import { Logger } from 'pino'
import { AgreementsServiceInterface } from './services/agreements'
import { create as createStream } from './controllers/stream'
import { createAuthMiddleware } from './middleware/auth'
import { HydraApi } from './apis/hydra'
import { StreamServiceInterface } from './services/stream'

export interface StreamAppContext extends Context {
  stream: StreamServiceInterface;
  agreements: AgreementsServiceInterface;
}

export type AppConfig = {
  streamService: StreamServiceInterface;
  agreementsService: AgreementsServiceInterface;
  hydraApi: HydraApi;
  logger: Logger;
}

export function createApp (appConfig: AppConfig): Koa {
  const app = new Koa<any, StreamAppContext>()
  const privateRouter = new Router<any, StreamAppContext>()
  const publicRouter = new Router<any, StreamAppContext>()

  app.use(cors())
  app.use(bodyParser())
  app.use(async (ctx, next) => {
    ctx.stream = appConfig.streamService
    ctx.agreements = appConfig.agreementsService
    ctx.logger = appConfig.logger
    await next()
  })

  // Health Endpoint
  publicRouter.get('/', (ctx) => {
    ctx.status = 200
  })

  privateRouter.use(createAuthMiddleware(appConfig.hydraApi))
  privateRouter.post('/stream', createStream)

  app.use(publicRouter.routes())
  app.use(privateRouter.routes())

  return app
}
