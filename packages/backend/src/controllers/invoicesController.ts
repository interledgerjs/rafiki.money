import { AppContext } from '../app'
import { Mandate } from '../models/mandate'

// export async function index(ctx: AppContext): Promise<void> {
//   const userId = ctx.request.query['userId']
//   const state = ctx.request.query['state']
//
//   const query = Agreement.query()
//     .where('userId', userId)
//     .andWhere('type', 'mandate')
//     .orderBy('createdAt', 'desc')
//
//   const now = new Date(Date.now()).getTime()
//
//   if (state) {
//     switch (state) {
//       case 'active':
//         query.where('expiry', '>', now).whereNull('cancelledAt')
//         break
//       case 'expired':
//         query.where('expiry', '<=', now)
//         break
//       case 'cancelled':
//         query.where('cancelledAt', '<=', now)
//         break
//       default:
//         throw new Error('Unknown state')
//     }
//   }
//
//   const agreements = await query
//
//   ctx.body = await Promise.all(
//     agreements.map(async agreement =>
//       Object.assign(agreement.$toJson(), {
//         balance:
//           Number(agreement.amount) -
//           (await ctx.agreementBucket.getFillLevel(agreement))
//       })
//     )
//   )
// }

// export async function show(ctx: AppContext): Promise<void> {
//   logger.debug('Show agreement request', {
//     path: ctx.request.path,
//     body: ctx.request.body,
//     headers: ctx.request.headers
//   })
//   const mandateId = ctx.request.params['id']
//   const mandate = await Agreement.query()
//     .where('id', mandateId)
//     .andWhere('type', 'mandate')
//     .first()
//
//   if (!mandate) {
//     ctx.response.status = 404
//     ctx.response.message = 'No mandate found'
//     return
//   }
//
//   ctx.body = Object.assign(mandate.$toJson(), {
//     balance:
//       Number(mandate.amount) - (await ctx.agreementBucket.getFillLevel(mandate))
//   })
// }

export async function store(ctx: AppContext): Promise<void> {
  const { logger } = ctx

  logger.debug('Create mandate request', {
    body: ctx.request.body,
    headers: ctx.request.headers
  })

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

