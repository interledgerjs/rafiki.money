import { log } from '../winston'
import { AppContext } from '../app'
import { Invoice } from '../models'
import { hydra } from '../services/hydra'

const logger = log.child({ component: 'Open Payments Invoices Controller' })

export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Create invoice', { body: ctx.request.body, headers: ctx.request.headers })
  let { body } = ctx.request
  try {
    const introspect = await validateToken(ctx)
    if (!introspect.sub)
      throw new Error('invalid token')
    const insertedInvoice = await Invoice.query().insertAndFetch(body)
    ctx.body = insertedInvoice.$toJson()
    ctx.response.status = 201
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 401
  }
}

export async function index (ctx: AppContext): Promise<void> {
  logger.debug('Index invoices', { headers: ctx.request.headers })
  try {
    const introspect = await validateToken(ctx)
    if (!introspect.sub)
      throw new Error('invalid token')
    const { body } = ctx
    let invoiceList: Object[] = []

    const userId = introspect.sub
    const invoices = await Invoice.query().where('userId', userId).orderBy('createdAt', 'desc')


    invoices.forEach((value) => {
      invoiceList.push(value.$toJson())
    })
    ctx.body = invoiceList
    ctx.response.status = 200
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 401
  }
}

export async function show (ctx: AppContext): Promise<void> {
  logger.debug('Show invoice by id', { headers: ctx.request.headers })

  try {
    const introspect = await validateToken(ctx)
    if (!introspect.sub)
      throw new Error('invalid token')
    const invoiceId = ctx.request.params.id
    const userId = introspect.sub
    const invoice = await Invoice.query().where('id', invoiceId).andWhere('userId', userId).first()

    if (invoice) {
      ctx.response.status = 200
      ctx.body = invoice.$toJson()
    } else {
      ctx.response.status = 404
      ctx.response.message = 'No invoice found'
    }
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 401
  }
}

export async function remove (ctx: AppContext): Promise<void> {
  logger.debug('Remove invoice by id', { headers: ctx.request.headers })
  try {
    const introspect = await validateToken(ctx)
    if (!introspect.sub)
      throw new Error('invalid token')
    const invoiceId = ctx.request.params.id
    const userId = introspect.sub
    const deletedInvoice = await Invoice.query().where('id', invoiceId)

    if (deletedInvoice.length) {
      await Invoice.query().update({ deletedAt: (Date.now() / 1000) }).where('id', invoiceId).andWhere('userId', userId)
      ctx.response.status = 200
      ctx.body = deletedInvoice
    } else {
      ctx.response.status = 404
      ctx.response.message = 'No invoice found'
    } 
  } catch (error) {
    logger.error(error.message)
    ctx.response.status = 401
  }
}

async function validateToken ( ctx: AppContext ) {
  const { header } = ctx
  let token = ''

  if (header && header.authorization) {
    const parts = header.authorization.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1]
    }
  }
  const introspection = await hydra.introspectToken(token).catch(error => {
    logger.debug('Error introspecting token', { error: error.response })
    throw error
  })

  return (introspection)
}
