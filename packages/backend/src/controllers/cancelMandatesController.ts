import { AppContext } from '../app'
import { Mandate } from '../models/mandate'

export async function store (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const mandateId = ctx.params.id

  logger.debug('Cancel mandate request', { mandateId })

  const mandate = await Mandate.query().where({
    userId: ctx.state.user.sub,
    id: mandateId
  }).first()

  if (!mandate) {
    return
  }

  await mandate.$query().patch({
    cancelledAt: new Date().toISOString()
  })

  ctx.status = 201
}
