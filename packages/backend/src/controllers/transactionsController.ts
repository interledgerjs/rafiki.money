import { AppContext } from '../app'
import { Account } from '../models/account'
import { Transaction } from '../models/transaction'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject
}

export async function store (ctx: AppContext): Promise<void> {
  const { body } = ctx.request
  const account = await Account.query().findById(body.accountId)

  if (!account) {
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await Account.transaction(async trx => {
      const trxAccount = await Account.query(trx).findById(account.id).forUpdate()

      if (!trxAccount) {
        throw new Error('Account not found')
      }

      const balance = trxAccount.balance
      const newBalance = balance - body.amount

      await Account.query(trx).findById(trxAccount.id).patch({
        balance: newBalance
      })

      await trxAccount.$relatedQuery('transactions', trx).insert({
        amount: body.amount,
        description: body.description
      })
    })

    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}

export async function index (ctx: AppContext): Promise<void> {
  const { accountId } = ctx.query

  const account = await Account.query().findById(accountId as string)

  if (!account) {
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  const transactions = await Transaction.query().where({ accountId: accountId })

  ctx.body = transactions.map(transaction => {
    return transaction.toJSON()
  })
}
