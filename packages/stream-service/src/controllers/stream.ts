import { StreamAppContext } from '../app'

export async function create (ctx: StreamAppContext): Promise<void> {
  const { user } = ctx.state
  const { agreements, stream } = ctx
  const { body } = ctx.request

  ctx.logger.info('Got request to send payment', { body })

  if (!user) {
    ctx.throw(400, 'User not found')
  }

  const { destinationAccount, sharedSecret } = await stream.queryPaymentPointer(body.paymentPointer)

  const agreement = await agreements.createAgreement({
    asset: {
      code: 'XRP',
      scale: 6
    },
    description: `Payment to ${body.paymentPointer}`,
    amount: body.amount,
    accountId: body.accountId,
    userId: user.sub,
    subject: 'wallet-stream-service'
  })

  if (!agreement) {
    ctx.logger.error('Agreement not created')
    ctx.throw(500)
  }

  ctx.logger.info('Created agreement to send payment', { agreement })

  // Initiate the STREAM and send
  ctx.logger.info('Initiating Payment', { agreement })
  try {
    await stream.payment(agreement.id, body.amount, destinationAccount, sharedSecret)
    // console.log(`sent "${stream.totalSent}"`)
  } catch (e) {
    ctx.logger.error('Error sending full payment', { error: e })
  }
  ctx.status = 201
}
