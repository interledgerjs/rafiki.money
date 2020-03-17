import { AppContext } from '../app'
import { MandateTransaction } from '../models/mandateTransaction'

export async function index (ctx: AppContext): Promise<void> {
  console.log(ctx)
  const mandateId = ctx.params.id

  ctx.logger.info('Getting mandate transactions', mandateId)

  const mandateTransactions = await MandateTransaction.query().where('mandateId', mandateId)

  ctx.body = mandateTransactions.map(transaction => {
    return transaction.toJSON()
  })
}
