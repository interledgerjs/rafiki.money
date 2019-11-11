import { createApp } from '../../src/app'
import createLogger from 'pino'
import { Server } from 'http'
import axios from 'axios'
import { fetch } from 'ilp-protocol-ildcp'
import { introspectFunction } from './mocks/introspection'
import { MockAgreementService } from './mocks/agreement-service'
import { MockAccountsService } from './mocks/accounts-service'
import { WalletPeersService } from '../../src/services/peers-service'
import { MockFxService } from './mocks/fx-service'

describe('Agreement ILDCP request', () => {
  const accountsService = new MockAccountsService()
  const agreementsService = new MockAgreementService()
  const fxService = new MockFxService()
  const peersService = new WalletPeersService('uplink', 'http://localhost:3003', '')

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
  beforeEach(async () => {
    server = app.listen(3002)
  })

  afterEach(async () => {
    if (server) {
      await server.close()
    }
  })

  describe('ildcp', () => {
    it('Can do an ILDCP request for an agreement', async () => {
      const ildcpResponse = await fetch((buffer: Buffer) => {
        return axios.post('http://localhost:3002/agreements/1/ilp', buffer, {
          responseType: 'arraybuffer',
          headers: {
            'content-type': 'application/octet-stream',
            authorization: 'Bearer good-token'
          }
        }).then(response => response.data)
      })

      expect(ildcpResponse).toEqual({
        clientAddress: 'test.wallet.agreements.1',
        assetScale: 6,
        assetCode: 'XRP'
      })

      console.log(ildcpResponse)
    })
  })
})
