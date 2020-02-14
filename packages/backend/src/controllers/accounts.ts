import { Account } from '../models/account'
import { AppContext } from '../app'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject
}

const enforceGetUserAcccounts = (subject: string, userId: string): boolean => {
  return userId === subject
}

export async function create (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const { body } = ctx.request

  ctx.logger.info('Creating an account', { body })

  const account = await Account.query().insertAndFetch({
    userId: 1,
    name: body.name,
    assetCode: 'USD',
    assetScale: 6,
    limit: 0n,
    balance: 0n
  })

  ctx.status = 201
  ctx.body = account.toJSON()
}

export async function update (ctx: AppContext): Promise<void> {
  const { accounts } = ctx
  const { id } = ctx.params
  const { body } = ctx.request

  ctx.logger.info('Updating an account', { id, body, ctx })

  const account = await Account.query().findById(id)

  if (!account) {
    ctx.status = 404
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  const updatedAccount = await Account.query().patchAndFetchById(account.id, {
    name: body.name
  })

  ctx.body = updatedAccount.toJSON()
}

export async function show (ctx: AppContext): Promise<void> {
  const { id } = ctx.params

  ctx.logger.info('Getting an account', { id })

  const account = await Account.query().findById(id)

  if (!account) {
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  ctx.body = account.toJSON()
}

export async function index (ctx: AppContext): Promise<void> {
  const { userId } = ctx.query

  ctx.logger.info('Getting an account', { userId })

  if (!enforceGetUserAcccounts(ctx.state.user.sub, userId)) {
    ctx.status = 403
    return
  }

  const userAccounts = await Account.query().where({ userId: userId })

  ctx.body = userAccounts.map(account => {
    return account.toJSON()
  })
}
