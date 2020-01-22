import Koa, { Context } from 'koa'
import createRouter, { Router } from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'
import cors from 'koa-cors'
import { Server, createServer } from 'http'
import { store as storeTransaction } from './controllers/agreementsTransactionController'
import { cancelAgreement } from './controllers/cancelAgreementsController'
import { log } from './winston'
import * as IntentsController from './controllers/intentsController'
import * as MandatesController from './controllers/mandatesController'
import * as MandatesSpendController from './controllers/mandatesSpendController'
import * as InvoicesController from './controllers/invoicesController'
import { AgreementBucketInterface } from './services/agreementBucket'
import * as IntentValidation from './route-validation/intents'
import * as MandatesValidation from './route-validation/mandates'
import * as InvoicesValidation from './route-validation/invoices'

const logger = log.child({ component: 'App' })

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

  private _setupRoutes (): void {
    this._router.post('/agreements/:id/transactions', storeTransaction)
    this._router.post('/agreements/:id/cancel',cancelAgreement )
    this._router.get('/', (ctx: Context) => { ctx.status = 200 })

    this._router.get('/intents', IntentsController.index)
    this._router.post('/intents', IntentValidation.store, IntentsController.store)
    this._router.get('/intents/:id', IntentsController.show)

    this._router.post('/mandates', MandatesValidation.store, MandatesController.store)
    this._router.get('/mandates', MandatesController.index)
    this._router.patch('/mandates/:id', MandatesValidation.update, MandatesController.update)
    this._router.get('/mandates/:id', MandatesController.show)

    this._router.post('/mandates/:id/spend', MandatesSpendController.store)

    this._router.post('/invoices',InvoicesValidation.store, InvoicesController.store)
    this._router.get('/invoices', InvoicesController.index)
    this._router.get('/invoices/:id', InvoicesController.show)
    this._router.delete('/invoices/:id', InvoicesController.remove)
  }
}
