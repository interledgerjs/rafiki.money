import { createContext } from '@interledger/rafiki-utils'
import { RafikiContextMixin } from '@interledger/rafiki-core'
import { RafikiServicesFactory } from '@interledger/rafiki-core/build/factories/rafiki-services'
import { RafikiWalletState } from '../../src/app'
import { createExtractAgreementFromTokenMiddleware } from '../../src/middleware/extract-agreement-from-token'

describe('Extract Agreement From Token Middleware', function () {

  const services = RafikiServicesFactory.build()
  test('attaches agreement from token onto Rafiki state', async () => {
    const ctx = createContext<RafikiWalletState, RafikiContextMixin>()
    ctx.services = services
    const agreement = {
      id: this.id,
      userId: this.userId,
      accountId: this.accountId,
      amount: this.amount,
      assetScale: this.assetScale,
      assetCode: this.assetCode,
      start: this.start,
      expiry: this.expiry,
      interval: this.interval,
      cycles: this.cycles,
      cap: this.cap
    }
    const hydraToken = {
      active: true,
      ext: {
        interledger: {
          agreement
        }
      },
      sub: '5'
    }
    ctx.state.user = hydraToken
    const middleware = createExtractAgreementFromTokenMiddleware()
    const next = jest.fn()

    await expect(middleware(ctx, next)).resolves.toBeUndefined()

    expect(next).toHaveBeenCalled()
    expect(ctx.state.agreement).toEqual(agreement)
  })

  test('does not attach agreement if not found in the introspected token', async () => {
    const ctx = createContext<RafikiWalletState, RafikiContextMixin>()
    ctx.services = services
    const hydraToken = {
      active: true,
      ext: {
        interledger: { }
      },
      sub: '5'
    }
    ctx.state.user = hydraToken
    const middleware = createExtractAgreementFromTokenMiddleware()
    const next = jest.fn()

    await expect(middleware(ctx, next)).resolves.toBeUndefined()
    expect(ctx.state.agreement).toBeUndefined()
  })
})
