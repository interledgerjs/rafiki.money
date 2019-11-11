import { createApp } from '../../src/app'
import createLogger from 'pino'
import { Server } from 'http'
import axios from 'axios'
import Koa from 'koa'
import { IlpPrepareFactory } from '@interledger/rafiki-core/build/factories'
import { serializeIlpPrepare, deserializeIlpPacket, serializeIlpFulfill } from 'ilp-packet'
import { introspectFunction } from './mocks/introspection'
import { MockAgreementService } from './mocks/agreement-service'
import { MockAccountsService } from './mocks/accounts-service'
import { WalletPeersService } from '../../src/services/peers-service'
import { MockFxService } from './mocks/fx-service'

describe('Incoming Agreement Requests', () => {
  const accountsService = new MockAccountsService()
  const agreementsService = new MockAgreementService()
  const fxService = new MockFxService()
  const peersService = new WalletPeersService('uplink', 'http://localhost:3003', '')

  const uplink = new Koa()

  uplink.use(async (ctx, next) => {
    ctx.body = serializeIlpFulfill({
      fulfillment: Buffer.alloc(32),
      data: Buffer.from('')
    })
  })

  const app = createApp({
    accountsService,
    agreementsService,
    fxService,
    peersService,
    introspection: introspectFunction,
    streamServerSecret: Buffer.alloc(32),
    ilpAddress: 'test.wallet',
    ilpStreamSubAddress: 'test.wallet.stream',
    prefix: 'test',
    logger: createLogger()
  })

  let server: Server
  let uplinkServer: Server
  beforeEach(async () => {
    server = app.listen(3002)
    uplinkServer = uplink.listen(3003)
  })

  afterEach(async () => {
    if (server) {
      await server.close()
    }
    if (uplinkServer) {
      await uplinkServer.close()
    }
  })

  describe('auth', () => {
    it('incorrect token gives an unauthorized error', async () => {
      const response = await axios.post('http://localhost:3002/ilp').then(response => {
        fail('Should not have gotten a good response')
      }).catch(error => {
        return error.response
      })

      expect(response.status).toBe(401)
    })

    it('Correct token not from uplink forwards packet to uplink', async () => {
      const prepare = IlpPrepareFactory.build({ amount: '49' })

      const response = await axios.post('http://localhost:3002/agreements/1/ilp', serializeIlpPrepare(prepare), {
        responseType: 'arraybuffer',
        headers: {
          'content-type': 'application/octet-stream',
          authorization: 'Bearer good-token'
        }
      })

      const reply = deserializeIlpPacket(response.data)
      expect(reply.type).toBe(13)
      expect(response.status).toBe(200)
    })

    it('Correct token from uplink forwards packet to uplink for stream receiving', async () => {
      const prepare = IlpPrepareFactory.build({ amount: '49', destination: 'test.wallet.stream.1.harry' })

      const response = await axios.post('http://localhost:3002/uplink/ilp', serializeIlpPrepare(prepare), {
        responseType: 'arraybuffer',
        headers: {
          'content-type': 'application/octet-stream',
          authorization: 'Bearer uplink-token'
        }
      })

      const reply = deserializeIlpPacket(response.data)
      expect(reply.type).toBe(14)
      expect(response.status).toBe(200)
    })
  })
})
