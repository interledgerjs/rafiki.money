/* //TODO:
    -[X] grab id from input
    -[X] find account by id
    -[X] get transactions array from account
    -[] return transactions related to account
*/

import { AppContext } from '../app'
import { Account } from '../models/account'
import { Transaction } from '../models/transaction'

// FIXME: proper enforcement
export async function index(ctx: AppContext): Promise<void> {
  const { accountId } = ctx.query
  console.log(accountId)

//   ctx.logger.info('Getting an account', { id })

//   const account = await Account.query().findById(id)
//   if (!account) {
//     return
//   }

  ctx.logger.info('Getting transactions for account', { accountId })

  const transactions = await Transaction.query().where({ accountId: accountId })

  if (!transactions) {
    return
  }

  ctx.body = transactions.map(transaction => {
    return transaction.toJSON()
  })
}
