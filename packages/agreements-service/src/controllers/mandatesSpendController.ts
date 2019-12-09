import { AppContext } from '../app'
import { Agreement } from '../models'
import { log } from '../winston'
import { queryPaymentPointer, Pay } from '../services/stream'

const logger = log.child({ component: 'Mandates Spend Controller' })

export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Mandate spend request', { body: ctx.request.body, headers: ctx.request.headers })
  const { headers } = ctx

  try {
    const mandateId = ctx.request.params['id']
    const mandate = await Agreement.query().where('id', mandateId).andWhere('type', 'mandate').first()

    // TODO enforce authz
    const authToken = getToken(headers)

    const { paymentPointer, amount } = ctx.request.body

    if (!mandate) {
      ctx.response.status = 404
      ctx.response.message = 'No mandate found'
      return
    }
    if(!mandate.cancelledAt) {
      ctx.response.status = 402
      ctx.response.message = 'Mandate has been cancelled by user'
      return
    }

    const spspDetails = await queryPaymentPointer(paymentPointer)

    // TODO, should this be sync or async
    try {
      await Pay(mandateId, amount, authToken, spspDetails.destinationAccount, spspDetails.sharedSecret)
    } catch(error) {
      logger.error('Error sending payment', { error })
    }

    ctx.response.status = 201
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

const getToken = (header: any) => {
  if (header && header.authorization) {
    const parts = header.authorization.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1]
    }
  }
}
