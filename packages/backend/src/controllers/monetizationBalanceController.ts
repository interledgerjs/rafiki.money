import { AppContext } from '../app'
import { Invoice, PaymentPointer, User } from '../models'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Payment pointer request', { path: ctx.request.path })

  const user = await User.query().where('id', ctx.state.user.sub).first()
  ctx.assert(user, 404, 'User not found')

  const paymentPointer = await PaymentPointer.query().where({
    userId: user.id
  }).first()

  const currentInvoice = await Invoice.query().findById(paymentPointer.currentMonetizationInvoiceId)

  let balance = 0
  if (currentInvoice && new Date(currentInvoice.expiresAt) > new Date()) {
    balance = Number(currentInvoice.received.toString())
  }

  ctx.body = {
    balance
  }
}
