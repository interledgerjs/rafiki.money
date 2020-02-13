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

  ctx.body = invoice.toJSON()
}

export async function store (ctx: AppContext): Promise<void> {
  const { logger } = ctx

  logger.info('Create invoice request', { body: ctx.request.body })

  try {
    const {
      assetScale,
      assetCode,
      amount,
      description
    } = ctx.request.body

    const invoice = await Invoice.query().insertAndFetch({
      description: description,
      assetCode,
      assetScale,
      amount: amount,
      balance: 0n
    })

    ctx.response.status = 201
    ctx.body = invoice.toJSON()
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}
