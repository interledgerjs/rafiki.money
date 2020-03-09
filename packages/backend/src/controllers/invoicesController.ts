import { AppContext } from '../app'
import { Invoice } from '../models/invoice'

export async function show (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  const invoiceId = ctx.params.id

  logger.info('Show invoice request', { headers: ctx.request.headers, invoiceId })

  const invoice = await Invoice.query().where('id', invoiceId).first()

  if (!invoice) {
    ctx.response.status = 404
    return
  }
  const invoiceObj = invoice.toJSON()

  const name = '//' + invoiceObj.subject.substring(invoiceObj.subject.indexOf('$') + 1, invoiceObj.subject.indexOf('/')) + '/invoices/' + invoiceObj.id

  ctx.body = {
    name,
    subject: invoiceObj.subject,
    amount: invoiceObj.amount,
    assetCode: invoiceObj.assetCode,
    assetScale: invoiceObj.assetScale,
    description: invoiceObj.description,
    received: invoiceObj.received
  }
}

export async function store (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  logger.info('Create invoice request', { body: ctx.request.body })

  try {
    const {
      assetScale,
      assetCode,
      amount,
      description,
      subject
    } = ctx.request.body

    const invoice = await Invoice.query().insertAndFetch({
      description: description,
      assetCode,
      assetScale,
      amount: amount,
      balance: 0n,
      subject,
      received: 0n
    })

    const invoiceObj = invoice.toJSON()

    const name = '//' + invoiceObj.subject.substring(invoiceObj.subject.indexOf('$') + 1, invoiceObj.subject.indexOf('/')) + '/invoices/' + invoiceObj.id

    ctx.response.status = 201
    ctx.body = {
      name,
      subject: invoiceObj.subject,
      amount: invoiceObj.amount,
      assetCode: invoiceObj.assetCode,
      assetScale: invoiceObj.assetScale,
      description: invoiceObj.description,
      received: invoiceObj.received
    }
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}
