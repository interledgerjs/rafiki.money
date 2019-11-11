import { RafikiContext } from '@interledger/rafiki-core'
import { AgreementsServiceInterface } from '../services/agreements-service'

export function createIncomingAgreementsMiddleware (agreementService: AgreementsServiceInterface) {
  return async ({ request, response, state }: RafikiContext, next: () => Promise<any>): Promise<void> => {
    const { amount } = request.prepare

    // Ignore zero amount packets
    if (amount === '0') {
      await next()
      return
    }

    // Attempt to take from the agreement mandate
    const agreementId = state.agreement && state.agreement.id // Get agreementId out of token

    // TODO need to potentially catch if error thrown in next to undo.
    if (agreementId) {
      await agreementService.addTransaction(agreementId, +amount)

      await next().catch(async (error) => {
        // Reverse
        await agreementService.addTransaction(agreementId, -amount)

        throw error
      })

      // Reverse amount taken from agreement if not a fulfill
      if (!response.fulfill) {
        await agreementService.addTransaction(agreementId, -amount)
      }
    } else {
      await next()
    }
  }
}
