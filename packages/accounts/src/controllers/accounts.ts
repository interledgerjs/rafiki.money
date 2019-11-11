import { AccountsAppContext } from '../'
import { Account, AccountProps } from '../services/accounts-service'

const allowedServices = process.env.ALLOWED_SERVICES || ['ilp-service', 'users-service']

const enforce = (subject: string, account: Account): boolean => {
  return account.userId === subject || allowedServices.includes(subject)
}

const enforceGetUserAcccounts = (subject: string, userId: string): boolean => {
  return userId === subject || allowedServices.includes(subject)
}

export async function create (ctx: AccountsAppContext): Promise<void> {
  const { accounts } = ctx
  const { body } = ctx.request

  ctx.logger.info('Creating an account', { body })

  const accountProps: AccountProps = {
    userId: ctx.state.user.sub,
    name: body.name,
    assetCode: 'XRP',
    assetScale: 6,
    limit: 0n
  }

  try {
    const account = await accounts.add(accountProps)
    ctx.body = {
      ...account,
      balance: account.balance.toString(),
      limit: account.limit.toString()
    }
  } catch (error) {
    ctx.logger.error('Error creating account', { error })
    throw error
  }
}

export async function update (ctx: AccountsAppContext): Promise<void> {
  const { accounts } = ctx
  const { id } = ctx.params
  const { body } = ctx.request

  ctx.logger.info('Updating an account', { id, body, ctx })

  const account = await accounts.get(id)

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  const accountProps: AccountProps = {
    userId: account.userId,
    name: body.name,
    assetCode: account.assetCode,
    assetScale: account.assetScale,
    limit: account.limit
  }

  try {
    const account = await accounts.update(id, accountProps)
    ctx.body = {
      ...account,
      balance: account.balance.toString(),
      limit: account.limit.toString()
    }
  } catch (error) {
    ctx.logger.error('Error creating account', { error })
    throw error
  }
}

export async function show (ctx: AccountsAppContext): Promise<void> {
  const { accounts } = ctx
  const { id } = ctx.params

  ctx.logger.info('Getting an account', { id })

  const account = await accounts.get(id)

  if (!account) {
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  ctx.body = {
    ...account,
    balance: account.balance.toString(),
    limit: account.limit.toString()
  }
}

export async function index (ctx: AccountsAppContext): Promise<void> {
  const { accounts } = ctx
  const { userId } = ctx.query

  ctx.logger.info('Getting an account', { userId })

  if (!enforceGetUserAcccounts(ctx.state.user.sub, userId)) {
    ctx.status = 403
    return
  }

  const userAccounts = await accounts.getByUserId(userId)

  ctx.body = userAccounts.map(account => {
    return {
      ...account,
      balance: account.balance.toString(),
      limit: account.limit.toString()
    }
  })
}
