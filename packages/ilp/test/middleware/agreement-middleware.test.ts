import {
  IlpFulfillFactory,
  IlpPrepareFactory,
  PeerFactory,
  RafikiServicesFactory
} from '@interledger/rafiki-core/build/factories'
import { RafikiContext, ZeroCopyIlpPrepare } from '@interledger/rafiki-core'
import { createContext } from '@interledger/rafiki-utils'
import { createIncomingAgreementsMiddleware } from '../../src/middleware/agreements'
import axios, { AxiosInstance } from 'axios'
import { AgreementsService } from '../../src/services/agreements-service'

jest.mock('axios')

describe('Agreement Middleware', function () {
  const services = RafikiServicesFactory.build()
  const alice = PeerFactory.build({ id: 'alice', maxPacketAmount: BigInt(50) })
  const bob = PeerFactory.build({ id: 'bob' })
  let ctx: any
  const axiosClient: AxiosInstance = {
    post: jest.fn(() => Promise.resolve())
  } as unknown as AxiosInstance
  const agreementService = new AgreementsService(axiosClient)
  const middleware = createIncomingAgreementsMiddleware(agreementService)

  beforeEach(() => {
    ctx = createContext<any, RafikiContext>()
    ctx.services = services
    ctx.peers = {
      get incoming () {
        return Promise.resolve(alice)
      },
      get outgoing () {
        return Promise.resolve(bob)
      }
    }
  })

  test('calls agreement service for correct amount for fulfill', async () => {
    ctx.state.agreement = {
      id: '123'
    }
    const fulfill = IlpFulfillFactory.build()
    const prepare = IlpPrepareFactory.build({ amount: '49' })
    ctx.request.prepare = new ZeroCopyIlpPrepare(prepare)
    const next = jest.fn().mockImplementation(() => {
      ctx.response.fulfill = fulfill
      return new Promise(resolve => {
        resolve()
      })
    })

    await expect(middleware(ctx, next)).resolves.toBeUndefined()

    expect(axiosClient.post).toHaveBeenCalledWith('/agreements/123/transactions', {
      amount: 49
    })
    expect(axiosClient.post).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalled()
  })

  test('Calls agreement service to reverse amount if no fulfill in response', async () => {
    ctx.state.agreement = {
      id: '123'
    }
    const prepare = IlpPrepareFactory.build({ amount: '49' })
    ctx.request.prepare = new ZeroCopyIlpPrepare(prepare)
    const next = jest.fn().mockResolvedValue(() => {

    })

    await expect(middleware(ctx, next)).resolves.toBeUndefined()

    expect(axiosClient.post).toHaveBeenCalledWith('/agreements/123/transactions', {
      amount: 49
    })
    expect(axiosClient.post).toHaveBeenCalledWith('/agreements/123/transactions', {
      amount: -49
    })
    expect(axiosClient.post).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenCalled()
  })

  test('Does not call agreement service if agreement not on state', async () => {
    delete ctx.state.agreement
    const prepare = IlpPrepareFactory.build({ amount: '49' })
    ctx.request.prepare = new ZeroCopyIlpPrepare(prepare)
    const next = jest.fn()

    await expect(middleware(ctx, next)).resolves.toBeUndefined()

    expect(axiosClient.post).toHaveBeenCalledTimes(0)
    expect(next).toHaveBeenCalled()
  })
})
