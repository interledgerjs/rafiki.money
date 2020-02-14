import { AppContext } from '../app'
import { Account } from '../models/account'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject
}

export async function create (ctx: AppContext): Promise<void> {
  const { body } = ctx.request

  const FAUCET_AMOUNT = 100000000n

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
      const limit = trxAccount.limit
      const newBalance = balance + FAUCET_AMOUNT

      await Account.query(trx).findById(trxAccount.id).patch({
        balance: newBalance
      })

      await trxAccount.$relatedQuery('transactions', trx).insert({
        amount: FAUCET_AMOUNT,
        description: 'Faucet money'
      })
    })

    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}
