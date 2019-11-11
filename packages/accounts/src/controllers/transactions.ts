import { AccountsAppContext } from '../index'
import { Account } from '../services/accounts-service'

const allowedServices = process.env.ALLOWED_SERVICES || ['ilp-service', 'users-service']

// TODO: Only our services should be able to call this I think
const enforceCreate = (subject: string): boolean => {
  return allowedServices.includes(subject)
}

const enforceGet = (subject: string, account: Account): boolean => {
  return allowedServices.includes(subject) || account.userId === subject
}

export async function create (ctx: AccountsAppContext): Promise<void> {
  const { accounts, transactions } = ctx
  const { body } = ctx.request

  const account = await accounts.get(body.accountId)

  if (!enforceCreate(ctx.state.user.sub)) {
    return
  }

  try {
    await transactions.create(account.id, BigInt(body.amount))
    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}

export async function index (ctx: AccountsAppContext): Promise<void> {
  const { accounts, transactions } = ctx
  const { accountId, aggregateTime } = ctx.query

  const account = await accounts.get(accountId)

  if (!enforceGet(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  ctx.body = await transactions.get(accountId, aggregateTime)
}
