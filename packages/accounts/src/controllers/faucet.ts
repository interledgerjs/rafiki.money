import { AccountsAppContext } from '../index'
import { Account } from '../services/accounts-service'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId === subject
}

export async function create (ctx: AccountsAppContext): Promise<void> {
  const { accounts, transactions } = ctx
  const { body } = ctx.request

  const FAUCET_AMOUNT = 100000000

  const account = await accounts.get(body.accountId)

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  try {
    await transactions.create(account.id, BigInt(FAUCET_AMOUNT), 'Faucet Money')
    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}
