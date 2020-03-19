import { AppContext } from '../app'
import { MandateTransaction } from '../models/mandateTransaction'

export async function index (ctx: AppContext): Promise<void> {
  const mandateId = ctx.params.id

  ctx.logger.info('Getting mandate transactions', mandateId)

  const mandateTransactions = await MandateTransaction.query()
    .where('mandateId', mandateId)
    .orderBy('createdAt', 'desc')

  ctx.body = mandateTransactions.map(transaction => {
    return transaction.toJSON()
  })
}
