import { randomBytes } from 'crypto'
import { log } from '../winston'
import { AppContext } from '../app'
import { Agreement } from '../models'

const logger = log.child({ component: 'Intents Controller' })
const HOST = process.env.HOST || 'http://localhost:4000'
const INTENT_ILP_BASE_ADDRESS = process.env.INTENT_ILP_BASE_ADDRESS || 'test.wallet'

export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Create intent request', { body: ctx.request.body, headers: ctx.request.headers })

  try {
    const { amount, asset: { scale, code }, secret, scope, callback } = ctx.request.body
    const salt = secret ? randomBytes(32).toString('base64') : undefined
    const start = new Date().getTime()
    const expiry = new Date(Date.now() + 60 * 60 * 1000).getTime()
    const agreement = await Agreement.query().insertAndFetch({ assetCode: code, assetScale: scale, amount, start, expiry, secret, secretSalt: salt, scope, callback, type: 'intent' })
    const intentUrl = new URL(`/intents/${agreement.id}`, HOST)
    const destination = `${INTENT_ILP_BASE_ADDRESS}.intents.${agreement.id}`

    ctx.response.status = 201
    ctx.set('location', intentUrl.toString())
    ctx.body = Object.assign(agreement.$toJson(), { destination })
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

export async function show (ctx: AppContext): Promise<void> {
  logger.debug('Show intent request', { path: ctx.request.path, headers: ctx.request.headers })

  const agreementId = ctx.request.params['id']
  const agreement = await Agreement.query().where('id', agreementId).andWhere('type', 'intent').first()

  if (!agreement) {
    ctx.response.status = 404
    ctx.response.message = 'No intent found'
    return
  }

  ctx.body = Object.assign(agreement.$toJson(), { balance: await ctx.agreementBucket.getFillLevel(agreement), destination: `${INTENT_ILP_BASE_ADDRESS}.intents.${agreementId}` })
}

export async function index (ctx: AppContext): Promise<void> {
  logger.debug('Index intents request', { query: ctx.request.query, headers: ctx.request.headers })

  const userId = ctx.request.query['userId']
  const agreements = await Agreement.query().where('userId', userId).andWhere('type', 'intent').orderBy('createdAt', 'desc')
  const transform = async (agreement: Agreement): Promise<any> => {
    const balance = Number(agreement.amount) - (await ctx.agreementBucket.getFillLevel(agreement))
    const destination = `${INTENT_ILP_BASE_ADDRESS}.intents.${agreement.id}`

    return Object.assign(agreement.$formatJson(), { balance, destination })
  }

  ctx.body = await Promise.all(agreements.map(transform))
}
