import Koa, { Context } from 'koa'
import createRouter, { Router } from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'
import { Server, createServer } from 'http'
import { store as storeTransaction } from './controllers/agreementsTransactionController'
import { log } from './winston'
import { Agreement } from './models'
import axios from 'axios'
import * as IntentsController from './controllers/intentsController'
import * as MandatesController from './controllers/mandatesController'
import { AgreementBucketInterface } from './services/agreementBucket'
import * as IntentValidation from './route-validation/intents'
import * as MandatesValidation from './route-validation/mandates'

const logger = log.child({ component: 'App' })
const TOKEN_INTROSPECTION_URL = process.env.TOKEN_INTROSPECTION_URL || 'http://localhost:9001/oauth2/introspect'

export interface AppContext extends Context {
  agreementBucket: AgreementBucketInterface;
}

export class App {
  private _koa: Koa
  private _router: Router
  private _server: Server

  constructor (private _agreementBucket: AgreementBucketInterface) {
    this._koa = new Koa<any, AppContext>()

    this._router = createRouter()
    this._koa.use(cors())
    this._setupRoutes()
    this._koa.use(bodyParser())
    this._koa.use(this._router.middleware())
    this._koa.context.agreementBucket = this._agreementBucket
  }

  public listen (port: number): void {
    logger.info('App listening on port: ' + port)
    this._server = createServer(this._koa.callback()).listen(port)
  }

  public shutdown (): void {
    if (this._server) {
      this._server.close()
    }
  }

  async getAgreementFromAuthToken (authToken: string): Promise<Agreement | undefined> {
    const data = await axios.post(TOKEN_INTROSPECTION_URL, {
      token: authToken
    }).then(resp => resp.data).catch(error => {
      logger.error('error introspecting auth token')
      throw error
    })

    return Agreement.query().findById(data.ext.agreementId)
  }

  private _setupRoutes (): void {
    this._router.post('/agreements/:id/transactions', storeTransaction)
    this._router.get('/', (ctx: Context) => { ctx.status = 200 })

    this._router.get('/intents', IntentsController.index)
    this._router.post('/intents', IntentValidation.store, IntentsController.store)
    this._router.get('/intents/:id', IntentsController.show)

    this._router.post('/mandates', MandatesValidation.store, MandatesController.store)
    this._router.get('/mandates', MandatesController.index)
    this._router.patch('/mandates/:id', MandatesValidation.update, MandatesController.update)
    this._router.get('/mandates/:id', MandatesController.show)
  }
}
