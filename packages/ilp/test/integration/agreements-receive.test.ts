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

describe('Outgoing Agreement Requests', () => {
  const accountsService = new MockAccountsService()
  const agreementsService = new MockAgreementService()
  const fxService = new MockFxService()
  const peersService = new WalletPeersService('uplink', 'http://localhost:3003', '')

  const downlink = new Koa()

  downlink.use(async (ctx, next) => {
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
  let downstreamServer: Server
  beforeEach(async () => {
    server = app.listen(3002)
    downstreamServer = downlink.listen(3004)
  })

  afterEach(async () => {
    if (server) {
      await server.close()
    }
    if (downstreamServer) {
      await downstreamServer.close()
    }
  })

  describe('Sending', () => {
    it('Correct token from uplink forwards packet to downstream link', async () => {
      const prepare = IlpPrepareFactory.build({ amount: '49', destination: 'test.wallet.agreements.1' })

      const response = await axios.post('http://localhost:3002/uplink/ilp', serializeIlpPrepare(prepare), {
        responseType: 'arraybuffer',
        headers: {
          'content-type': 'application/octet-stream',
          authorization: 'Bearer uplink-token'
        }
      })

      const reply = deserializeIlpPacket(response.data)
      expect(reply.type).toBe(13)
      expect(response.status).toBe(200)
    })
  })
})
