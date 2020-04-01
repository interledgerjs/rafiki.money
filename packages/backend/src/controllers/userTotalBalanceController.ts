import { User } from '../models/user'
import { AppContext } from '../app'
import { Account } from '../models'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Get users balance')
  ctx.assert(ctx.state.user && ctx.state.user.sub, 401)

  const user = await User.query().where('id', ctx.state.user.sub).first()
  ctx.assert(user, 404, 'User not found')

  const balance = await Account.query().where('userId', user.id).sum('balance').first()

  ctx.body = {
    balance: balance['sum']
  }
}
