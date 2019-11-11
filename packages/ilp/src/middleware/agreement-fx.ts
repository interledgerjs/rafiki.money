import { RafikiContext } from '@interledger/rafiki-core'
import { FxServiceInterface } from '../services/fx-service'

export function createIncomingAgreementFXMiddleware (fxService: FxServiceInterface) {
  return async ({ request, state }: RafikiContext, next: () => Promise<any>): Promise<void> => {
    const { amount } = request.prepare

    // Ignore zero amount packets
    if (amount === '0') {
      await next()
      return
    }

    // Attempt to take from the agreement mandate
    const agreement = state.agreement

    if (agreement) {
      const convertedAmount = await fxService.convert(agreement.asset.code, 'XRP', agreement.asset.scale, 6, BigInt(amount))

      if (convertedAmount === 0n) {
        throw new Error('Packet size to small, FX converted amount to zero')
      }

      request.prepare.amount = convertedAmount.toString()

      await next()
    } else {
      await next()
    }
  }
}
