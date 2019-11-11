import { RafikiMiddleware, RafikiContext } from '@interledger/rafiki-core'
import { RafikiWalletState } from '../app'

export function createExtractAgreementFromTokenMiddleware (): RafikiMiddleware {
  return async function extractAgreementFromToken ({ state, services: { logger } }: RafikiContext<RafikiWalletState>, next: () => Promise<any>): Promise<void> {
    if (state.user && state.user['ext'] && state.user!['ext']['interledger'] && state.user!['ext']['interledger']['agreement']) {
      state.agreement = state.user!['ext']['interledger']['agreement']
      await next()
    } else {
      logger.debug('Could not find agreement in introspected token.', { tokenInfo: state.user })
      await next()
    }
  }
}
