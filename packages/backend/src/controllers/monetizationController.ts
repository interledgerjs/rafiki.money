import { AppContext } from '../app'
import { Invoice, PaymentPointer } from '../models'
import { identifierToPaymentPointer } from '../utils'

const getOrCreateMonetizationInvoice = async (paymentPointer: PaymentPointer): Promise<Invoice> => {
  const currentInvoice = await Invoice.query().findById(paymentPointer.currentMonetizationInvoiceId)
  if (!currentInvoice || (new Date(currentInvoice.expiresAt) < new Date())) {
    return PaymentPointer.transaction(async (trx) => {
      const paymentPointerLocked = await PaymentPointer.query(trx).findById(paymentPointer.id).forUpdate()

      // New invoice generated already
      if (paymentPointerLocked.currentMonetizationInvoiceId !== paymentPointer.currentMonetizationInvoiceId) {
        return Invoice.query(trx).findById(paymentPointerLocked.currentMonetizationInvoiceId)
      }

      const newInvoice = await Invoice.query(trx).insert({
        assetCode: 'USD',
        assetScale: 6,
        subject: identifierToPaymentPointer(paymentPointerLocked.identifier),
        accountId: paymentPointer.accountId,
        userId: paymentPointer.userId,
        description: 'Monetization',
        expiresAt: (new Date(Date.now() + 1 * 60 * 60 * 1000)).toISOString()
      })
      await PaymentPointer.query(trx).findById(paymentPointerLocked.id).patch({
        currentMonetizationInvoiceId: newInvoice.id
      })
      return newInvoice
    })
  }
  return currentInvoice
}

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Payment pointer request', { path: ctx.request.path })

  const identifier = ctx.params.username

  const paymentPointer = await PaymentPointer.query().where({
    'identifier': identifier
  }).first()

  ctx.assert(paymentPointer, 404)

  // TODO add better rotation of Invoices
  const invoice = await getOrCreateMonetizationInvoice(paymentPointer)

  const credentials = ctx.streamService.generateStreamCredentials(invoice.id)

  if (ctx.get('Accept').indexOf('application/spsp4+json') !== -1) {
    ctx.body = {
      destination_account: credentials.ilpAddress,
      shared_secret: credentials.sharedSecret.toString('base64')
    }
    ctx.set('Content-Type', 'application/spsp4+json')
    ctx.set('Access-Control-Allow-Origin', '*')
  } else {
    ctx.body = {
      ilpAddress: credentials.ilpAddress,
      sharedSecret: credentials.sharedSecret.toString('base64')
    }
  }
}
