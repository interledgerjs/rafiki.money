import { AppContext } from '../app'
import { Mandate } from '../models/mandate'

export async function index (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const userId = ctx.state.user.sub
  const state = ctx.query.state

  const query = Mandate.query()
    .where('userId', userId)
    .orderBy('createdAt', 'desc')

  const now = new Date(Date.now())

  if (state) {
    switch (state) {
      case 'active':
        query.where((q) => {
          q.where('expireAt', '>', now).orWhereNull('expireAt')
        }).whereNull('cancelledAt')
        break
      case 'expired':
        query.where('expireAt', '<=', now).whereNull('cancelledAt')
        break
      case 'cancelled':
        query.whereNotNull('cancelledAt')
        break
      default:
        throw new Error('Unknown state')
    }
  }

  const mandates = await query

  ctx.body = mandates.map(mandate => {
    return mandate.toJSON()
  })
}

export async function show (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const mandateId = ctx.params.id
  const user = ctx.state.user

  logger.info('Get Mandate', {
    mandateId,
    userId: user.id
  })

  const mandate = await Mandate.query().where({
    userId: user.sub,
    id: mandateId
  }).first()

  if (!mandate) {
    return
  }

  ctx.body = mandate.toJSON()
}

export async function store (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  logger.info('Create mandate request', { body: ctx.request.body })

  try {
    const {
      assetScale,
      assetCode,
      amount,
      description,
      startAt,
      expireAt,
      scope,
      interval,
      cap
    } = ctx.request.body

    const mandate = await Mandate.query().insertAndFetch({
      description: description,
      assetCode,
      assetScale,
      amount: amount,
      balance: 0n,
      startAt: startAt || new Date(Date.now()),
      expireAt: expireAt || null,
      interval: interval,
      cap,
      scope
    })

    ctx.response.status = 201
    ctx.body = mandate.$toJson()
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

// export async function update(ctx: AppContext): Promise<void> {
//   logger.debug('Update mandate request', {
//     body: ctx.request.body,
//     headers: ctx.request.headers
//   })
//
//   try {
//     const mandate = await Agreement.query()
//       .where('id', ctx.request.params['id'])
//       .andWhere('type', 'mandate')
//       .first()
//     if (!mandate) {
//       ctx.response.status = 404
//       ctx.response.message = 'No mandate found'
//       return
//     }
//     if (mandate.cancelledAt) {
//       ctx.response.status = 400
//       ctx.response.message = 'Cancelled mandate'
//       return
//     }
//
//     // TODO validate user owns account
//     const { userId, accountId, scope } = ctx.request.body
//     const updatedData = {}
//     if (userId) updatedData['userId'] = userId
//     if (accountId) updatedData['accountId'] = accountId
//     if (scope) updatedData['scope'] = scope
//
//     logger.debug('updating mandate', { updatedData })
//     const updatedMandate = await mandate.$query().updateAndFetch(updatedData)
//     ctx.body = updatedMandate.$toJson()
//   } catch (error) {
//     logger.error(error.message)
//     ctx.response.status = 400
//     ctx.body = 'Can only update userId and accountId'
//   }
// }
