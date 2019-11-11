import { log } from '../winston'
import { AppContext } from '../app'
import { Agreement } from '../models'

const logger = log.child({ component: 'Agreements Controller' })

export async function index (ctx: AppContext): Promise<void> {
  const userId = ctx.request.query['userId']
  const state = ctx.request.query['state']

  const query = Agreement.query().where('userId', userId).andWhere('type', 'mandate').orderBy('createdAt', 'desc')

  const now = new Date(Date.now()).getTime()

  if (state) {
    switch (state) {
      case ('active'):
        query.where('expiry', '>', now)
        break
      case ('expired'):
        query.where('expiry', '<=', now)
        break
      default:
        throw new Error('Unknown state')
    }
  }

  const agreements = await query

  ctx.body = await Promise.all(agreements.map(async agreement => Object.assign(agreement.$toJson(), { balance: Number(agreement.amount) - (await ctx.agreementBucket.getFillLevel(agreement)) })))
}

export async function show (ctx: AppContext): Promise<void> {
  logger.debug('Show agreement request', { path: ctx.request.path, body: ctx.request.body, headers: ctx.request.headers })
  const mandateId = ctx.request.params['id']
  const mandate = await Agreement.query().where('id', mandateId).andWhere('type', 'mandate').first()

  if (!mandate) {
    ctx.response.status = 404
    ctx.response.message = 'No mandate found'
    return
  }

  ctx.body = Object.assign(mandate.$toJson(), { balance: Number(mandate.amount) - (await ctx.agreementBucket.getFillLevel(mandate)) })
}

export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Create mandate request', { body: ctx.request.body, headers: ctx.request.headers })

  try {
    const { asset: { scale, code }, scope, amount, description, start, expiry, cycles, interval, cap, subject, userId, accountId } = ctx.request.body
    const startEpoch = start || new Date(Date.now()).getTime()
    const expiryEpoch = expiry || new Date(Date.now() + 60 * 60 * 1000).getTime()

    // TODO validate user owns account

    const mandate = await Agreement.query().insertAndFetch({ assetCode: code, assetScale: scale, description, amount, start: startEpoch, expiry: expiryEpoch, type: 'mandate', cycles, interval, cap, scope, subject, userId, accountId })

    ctx.response.status = 201
    ctx.body = mandate.$toJson()
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

export async function update (ctx: AppContext): Promise<void> {
  logger.debug('Update mandate request', { body: ctx.request.body, headers: ctx.request.headers })

  try {
    const mandate = await Agreement.query().where('id', ctx.request.params['id']).andWhere('type', 'mandate').first()
    if (!mandate) {
      ctx.response.status = 404
      ctx.response.message = 'No mandate found'
      return
    }

    // TODO validate user owns account
    const { userId, accountId, scope } = ctx.request.body
    const updatedData = {}
    if (userId) updatedData['userId'] = userId
    if (accountId) updatedData['accountId'] = accountId
    if (scope) updatedData['scope'] = scope

    logger.debug('updating mandate', { updatedData })
    const updatedMandate = await mandate.$query().updateAndFetch(updatedData)
    ctx.body = updatedMandate.$toJson()
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 400
    ctx.body = 'Can only update userId and accountId'
  }
}
