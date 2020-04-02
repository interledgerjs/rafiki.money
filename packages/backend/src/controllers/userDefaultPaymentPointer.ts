import { User } from '../models/user'
import { AppContext } from '../app'
import { PaymentPointer } from '../models'
import { identifierToPaymentPointer } from '../utils'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Get users balance')
  ctx.assert(ctx.state.user && ctx.state.user.sub, 401)

  const user = await User.query().where('id', ctx.state.user.sub).first()
  ctx.assert(user, 404, 'User not found')

  const paymentPointer = await PaymentPointer.query().where('userId', user.id).first()

  ctx.body = {
    paymentPointer: paymentPointer ? identifierToPaymentPointer(paymentPointer.identifier) : ''
  }
}
