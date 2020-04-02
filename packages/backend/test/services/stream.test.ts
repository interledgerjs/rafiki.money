import { StreamService } from '../../src/services/stream'
import MockPlugin from '../mocks/plugin'
import createLogger from 'pino'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { createConnection } from 'ilp-protocol-stream'
import { Invoice } from '../../src/models/invoice'
import { InvoiceTransaction } from '../../src/models/invoiceTransaction'

describe('STREAM Service Test', () => {
  let streamService: StreamService
  let appContainer: TestAppContainer
  let serverPlugin: MockPlugin
  let clientPlugin: MockPlugin

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
    serverPlugin = new MockPlugin()
    clientPlugin = serverPlugin.mirror
    const logger = createLogger()
    streamService = new StreamService({ key: '716343aed8ac20ef1853e04c11ed9a0e', plugin: serverPlugin as any, logger })
    await streamService.listen()
  })

  afterEach(async () => {
    await streamService.close()
    await appContainer.knex.migrate.rollback()
  })

  afterAll(async () => {
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  describe('Credentials Test', () => {
    test('Can get STREAM credentials with an invoiceId', async () => {
      const credentials = streamService.generateStreamCredentials('')

      expect(credentials.ilpAddress).toBeDefined()
      expect(credentials.ilpAddress).toContain('test.peerA')
      expect(credentials.sharedSecret).toBeDefined()
    })
  })

  describe('Stream Receiving Test', () => {
    test('Received STREAM has connection allocated to Invoice', async (done) => {
      const invoice = await Invoice.query().insert({
        assetCode: 'USD',
        assetScale: 6,
        amount: 1000000n,
        subject: '$rafiki.money/p/don'
      })

      const credentials = streamService.generateStreamCredentials(invoice.id)

      const streamClient = await createConnection({
        plugin: clientPlugin,
        destinationAccount: credentials.ilpAddress,
        sharedSecret: credentials.sharedSecret
      })

      const stream = await streamClient.createStream()
      stream.setSendMax(1000000)
      let total = 0
      stream.on('outgoing_money', async (amount) => {
        total += Number(amount)
        if (total === 1000000) {
          // We have sent it but other side hasn't receive it yet
          await new Promise(resolve => setTimeout(resolve, 150))
          const totalReceived = await InvoiceTransaction.query().where('invoiceId', invoice.id).sum('amount').then(data => {
            return Number(data[0]['sum'])
          })
          expect(totalReceived).toEqual(1000000)
          done()
        }
      })
    })
  })
})
