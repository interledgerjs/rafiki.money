import { log } from '../winston'
import { AppContext } from '../app'
import { Agreement } from '../models'

const logger = log.child({ component: 'Agreements Transaction Controller' })

/**
 * Attempt to add a new transaction by using the agreement bucket bound to the ctx.
 * If Successful returns 201, if no funds available/error it throws a 404
 * @param ctx
 */
export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Create agreement transaction request', { body: ctx.request.body, headers: ctx.request.headers })
  const agreementId = ctx.request.params['id']
  const { amount } = ctx.request.body
  try {
    const agreement = await Agreement.query().where('id', agreementId).first()
    if (!agreement) throw new Error('agreement not found')

    // Attempt to take from agreement bucket
    await ctx.agreementBucket.take(agreement, amount)

    ctx.response.status = 201
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 403
  }
}
