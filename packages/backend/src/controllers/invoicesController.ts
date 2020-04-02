import { AppContext } from '../app'
import { Invoice } from '../models/invoice'
import { paymentPointerToIdentifier } from '../utils'
import { Account, PaymentPointer } from '../models'

export async function show (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  const invoiceId = ctx.params.id

  logger.info('Show invoice request', { headers: ctx.request.headers, invoiceId })

  const invoice = await Invoice.query().where('id', invoiceId).first()

  if (!invoice) {
    ctx.response.status = 404
    return
  }

  ctx.body = invoice.toJSON()
}

export async function store (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const { body } = ctx.request

  logger.info('Create invoice request', { body: body })

  // Determine subject payment pointer and account
  const identifier = paymentPointerToIdentifier(body.subject)
  const paymentPointer = await PaymentPointer.query().where('identifier', identifier).first()

  if (!paymentPointer) {
    return
  }

  const account = await Account.query().findById(paymentPointer.accountId)

  try {
    const {
      amount,
      description,
      subject
    } = ctx.request.body

    const invoice = await Invoice.query().insertAndFetch({
      description: description,
      assetCode: account.assetCode,
      assetScale: account.assetScale,
      amount: amount,
      balance: 0n,
      subject,
      received: 0n
    })

    ctx.response.status = 201
    ctx.body = invoice.toJSON()
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

export async function update (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  const invoiceId = ctx.params.id

  logger.info('Update to invoice invoice request', { invoiceId })

  const invoice = await Invoice.query().where('id', invoiceId).first()

  if (!invoice) {
    ctx.response.status = 404
    return
  }

  ctx.body = invoice.toJSON()
}

export async function options (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Payment Details Request for Invoice', { path: ctx.request.path })
  const invoiceId = ctx.params.id
  const invoice = await Invoice.query().findById(invoiceId)

  if (!invoice) {
    return
  }

  const credentials = ctx.streamService.generateStreamCredentials(invoice.id)
  ctx.body = {
    ilpAddress: credentials.ilpAddress,
    sharedSecret: credentials.sharedSecret.toString('base64')
  }
}
