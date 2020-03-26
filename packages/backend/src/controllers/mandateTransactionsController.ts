import { AppContext } from '../app'
import { MandateTransaction } from '../models/mandateTransaction'
import { Mandate } from '../models/mandate'

const enforce = (subject: string, mandate: Mandate): boolean => {
  return mandate.userId.toString() === subject
}

export async function index (ctx: AppContext): Promise<void> {
  const mandateId = ctx.params.id

  ctx.logger.info('Getting mandate transactions', mandateId)

  const mandate: Mandate = await Mandate.query()
    .where('id', mandateId)
    .first()

  if (!enforce(ctx.state.user.sub, mandate)) {
    ctx.status = 404
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
