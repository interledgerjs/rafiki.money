import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import nock from 'nock'
import { Invoice, InvoiceInfo, User } from '../../src/models'
import { Transaction } from 'knex'
import { mockAuth } from '../helpers/auth'
import { Model } from 'objection'

describe('Validate Payment Pointer', function () {
  let appContainer: TestAppContainer
  let user: User
  let invoice: Invoice
  let trx: Transaction
  let jsonInvoice: Partial<InvoiceInfo>
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
    await appContainer.knex.migrate.latest()
  })

  beforeEach(async () => {
    trx = await appContainer.knex.transaction()
    Model.knex(trx)
    user = await User.query().insert({
      username: 'alice'
    })
    invoice = await Invoice.query().insert({
      description: 'Test invoice',
      assetScale: 6,
      assetCode: 'USD',
      amount: 5000000n,
      subject: '$wallet.com/alice',
      balance: 0n,
      received: 0n
    })
    jsonInvoice = invoice.$formatJson()
    jsonInvoice.name = `//wallet.com/invoices/${invoice.id}`
    nock('https://wallet.com/invoices')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get(`/${invoice.id}`)
      .reply(200, jsonInvoice)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
  })

  afterAll(async () => {
    await appContainer.knex.migrate.rollback()
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  test('Validates Invoice with name structure', async () => {
    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/validate/invoices?q=${jsonInvoice.name}`)

    expect(status).toEqual(200)
    expect(data).toMatchObject({
      id: invoice.id
    })
  })

  test('Validates Invoice with url structure', async () => {
    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/validate/invoices?q=https:${jsonInvoice.name}`)

    expect(status).toEqual(200)
    expect(data).toMatchObject({
      id: invoice.id
    })
  })

  test('Throw Error if not a valid Invoice', async () => {
    const { status } = await axios.get(`http://localhost:${appContainer.port}/validate/invoices?q=google.com`)
      .catch(error => {
        return error.response
      })

    expect(status).toEqual(404)
  })
})
