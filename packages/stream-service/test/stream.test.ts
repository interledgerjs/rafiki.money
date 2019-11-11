import createLogger from 'pino'
import { createApp } from '../src/app'
import Koa from 'koa'
import { Server } from 'http'
import got from 'got'
import { TokenInfo } from '../src/apis/hydra'
import { MockStreamService } from './mocks/stream-service'
import { MockAgreementsService } from './mocks/agreements-service'

describe('Stream API Test', () => {
  let app: Koa
  let server: Server
  let port: number
  const streamService = new MockStreamService()
  const agreementsService = new MockAgreementsService()

  beforeAll(async () => {
    app = createApp({
      logger: createLogger(),
      streamService,
      agreementsService,
      hydraApi: {
        introspectToken: async (token) => {
          if (token === 'user1token') {
            return {
              sub: '1',
              active: true
            } as TokenInfo
          } else if (token === 'user2token') {
            return {
              sub: '2',
              active: true
            } as TokenInfo
          } else if (token === 'user3token') {
            return {
              sub: '3',
              active: false
            } as TokenInfo
          } else {
            throw new Error('Getting Token failed')
          }
        }
      }

    })
    server = app.listen(0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    port = server.address().port
  })

  beforeEach(async () => {
  })

  afterEach(async () => {
  })

  afterAll(() => {
    server.close()
  })

  describe('Create a STREAM payment', () => {
    test('Can stream a payment for a valid user', async () => {
      const mock = jest.fn()
      mock.mockImplementation(() => {
        return {
          id: '1'
        }
      })
      agreementsService.createAgreement = mock

      const response = await got.post(`http://localhost:${port}/stream`, {
        headers: {
          authorization: 'Bearer user1token'
        },
        json: true,
        body: {
          amount: '1000000',
          accountId: '4',
          paymentPointer: '$rafiki.money/p/matt'
        }
      })

      expect(mock).toBeCalledWith({
        userId: '1',
        accountId: '4',
        amount: '1000000',
        asset: {
          code: 'XRP',
          scale: 6
        },
        description: 'Payment to $rafiki.money/p/matt'
      })
      expect(response.statusCode).toBe(201)
    })

    test('Invalid auth token wont allow stream payment', async () => {
      await got.post(`http://localhost:${port}/stream`, {
        headers: {
          authorization: 'Bearer bad-token'
        },
        json: true,
        body: {
          userId: 1,
          accountId: 1,
          paymentPointer: '$rafiki.money/p/matt'
        }
      }).catch((error) => {
        expect(error.statusCode).toBe(401)
      })
    })
  })
})
