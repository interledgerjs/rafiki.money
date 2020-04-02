import { Account } from '../models/account'
import { AppContext } from '../app'
import { Transaction } from '../models'

const enforceGetUserAcccounts = (subject: string, userId: string): boolean => {
  return userId === subject
}

export async function index (ctx: AppContext): Promise<void> {
  const { id } = ctx.params
  ctx.logger.info('Getting an account transactions', { accountId: id })

  const account = await Account.query().findById(id)

  if (!account) {
    ctx.status = 404
    return
  }

  if (!enforceGetUserAcccounts(ctx.state.user.sub, account.userId.toString())) {
    ctx.status = 403
    return
  }

  const accountTransactions = await Transaction.query().where({ accountId: account.id }).orderBy('id')

  ctx.body = accountTransactions.map(transaction => {
    return transaction.toJSON()
  })
}
