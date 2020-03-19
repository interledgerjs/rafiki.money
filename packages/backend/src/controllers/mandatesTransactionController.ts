import { AppContext } from '../app'
import { MandateTransaction } from '../models/mandateTransaction'
import { Mandate } from '../models/mandate'

const enforce = (subject: string, mandate: Mandate): boolean => {
  return mandate.userId.toString() === subject
}

export async function index (ctx: AppContext): Promise<void> {
  const mandateId = ctx.params.id

  ctx.logger.info('Getting mandate transactions', mandateId)

  // fetch mandate (mandate id)

  const mandate: Mandate = await Mandate.query()
    .where('id', mandateId)
    .first()

  // enforce should be run against mandate owner id

  if (!enforce(ctx.state.user.sub, mandate)) {
    ctx.status = 403
    return
  }

  const mandateTransactions: Array<MandateTransaction> = await MandateTransaction.query()
    .where('mandateId', mandateId)
    .orderBy('createdAt', 'desc')

  if (!mandateTransactions) {
    ctx.status = 404
    return
  }

  ctx.body = mandateTransactions.map(transaction => {
    return transaction.toJSON()
  })
}
