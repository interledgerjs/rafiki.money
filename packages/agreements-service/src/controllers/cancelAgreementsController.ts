import { log } from '../winston'
import { AppContext } from '../app'
import { Agreement } from '../models'

const logger = log.child({ component: 'Cancel Agreements Controller'})

export async function cancelAgreement(ctx: AppContext): Promise<void> {
  logger.debug('Cancel mandate request', {
    body: ctx.request.body,
    headers: ctx.request.headers
  })

  try {
    const agreement = await Agreement.query()
      .where('id', ctx.request.params['id'])
      .first()
    if (!agreement) {
      ctx.response.status = 404
      ctx.response.message = 'No agreement found'
      return
    }
    if (agreement.cancelledAt) {
      ctx.response.status = 400
      ctx.response.message = 'Cancelled agreement'
      return
    }
    const now = new Date().getTime()

    logger.debug('cancelling agreement', { cancelledAt: now })
    const updatedAgreement = await agreement.$query().updateAndFetch({cancelledAt: now })
    ctx.body = updatedAgreement.$toJson()
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 400
    ctx.body = 'Unable to cancel agreement'
  }
}
