import { FxService } from '../../src/services/fx-service'
import { AxiosInstance } from 'axios'

describe('Accounts Services', () => {
  let fxService: FxService
  let fxClient: AxiosInstance

  beforeEach(() => {
    fxClient = {
      get: jest.fn((value) => {
        return Promise.resolve({
          data: { USD: 0.25 }
        })
      })
    } as unknown as AxiosInstance
    fxService = new FxService({
      fxClient,
      defaultCacheTime: 5000
    })
  })

  test('Converts for same scale ', async () => {
    const value = await fxService.convert('xrp', 'usd', 2, 2, 400n)

    expect(value.toString()).toStrictEqual('100')
  })

  /**
   * Convert $0.01 to XRP which is asset scale of 6 and conversion rate of 2.5
   */
  test('Can convert from smaller asset to larger asset', async () => {
    // @ts-ignore
    fxClient.get = jest.fn(() => Promise.resolve({ data: { XRP: 2.5 } }))
    const value = await fxService.convert('usd', 'xrp', 2, 6, 1n)

    expect(value.toString()).toStrictEqual('25000')
  })

  /**
   * Convert 1 XRP to USD which is asset scale of 2 and conversion rate of 0.25
   */
  test('Can convert from larger asset to smaller asset', async () => {
    const value = await fxService.convert('xrp', 'usd', 6, 2, 1000000n)

    expect(value.toString()).toStrictEqual('25')
  })
})
