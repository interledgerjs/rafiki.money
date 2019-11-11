import { RafikiContext } from '@interledger/rafiki-core'

// One option is to do the whole find intent, do FX and send to callback all within this one middleware
export function createOutgoingIntentsMiddleware (ILP_ADDRESS: string) {
  return async ({ request, response, services: { logger } }: RafikiContext, next: () => Promise<any>): Promise<void> => {
    const { destination, data } = request.prepare

    logger.debug('Got into outgoing intents middleware')
    if (destination.startsWith(ILP_ADDRESS + '.intents')) {
      logger.debug('Fulfilling Intent')
      response.fulfill = {
        fulfillment: data,
        data: Buffer.from('')
      }

      return
    }

    // Add special regex for intents to see if this is an intent

    await next()
  }
}
