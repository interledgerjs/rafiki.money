import { AppContext } from '../app'
import { PaymentPointer } from '../models'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Payment pointer request', { path: ctx.request.path })
  const identifier = ctx.params.username
  const paymentPointer = await PaymentPointer.query().where({
    'identifier': identifier
  }).first()

  ctx.assert(paymentPointer, 404)

  // Determine if there is an Open Invoice, if not create one

  const credentials = ctx.streamService.generateStreamCredentials('')
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
