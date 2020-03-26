import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { Invoice } from '../../src/models/invoice'
import { User } from '../../src/models/user'
import { Transaction } from 'knex'
import { Model } from 'objection'

describe('Create invoice', () => {
  let appContainer: TestAppContainer
  let user: User
  let trx: Transaction
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

  test('can create invoice', async () => {

    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/invoices`, {
      subject: '$wallet.example/alice',
      assetCode: 'USD',
      assetScale: 2,
      amount: '500',
      description: 'Test invoice'
    }, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    const invoice = await Invoice.query().first()

    expect(status).toEqual(201)
    expect(data.name).toEqual(`//localhost:3001/invoices/${invoice.id}`)
    expect(data.subject).toEqual('$wallet.example/alice')
    expect(data.amount).toEqual('500')
    expect(data.assetCode).toEqual('USD')
    expect(data.assetScale).toEqual(2)
    expect(data.description).toEqual('Test invoice')
    expect(data.received).toEqual('0')

    expect(invoice).toBeDefined()
    expect(invoice!.amount.toString()).toEqual('500')
    expect(invoice!.description).toEqual('Test invoice')
    expect(invoice!.assetCode).toEqual('USD')
    expect(invoice!.assetScale).toEqual(2)
    expect(invoice!.received.toString()).toEqual('0')
    expect(invoice!.expiresAt).toBeNull()
    expect(invoice!.description).toEqual('Test invoice')
    expect(invoice!.subject).toEqual('$wallet.example/alice')
  })
})

describe('Get an invoice', () => {
  let appContainer: TestAppContainer
  let user: User
  let invoice: Invoice
  let trx: Transaction
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
      assetScale: 2,
      assetCode: 'USD',
      amount: 500n,
      subject: '$wallet.example/alice',
      balance: 0n,
      received: 0n
    })
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

  test('Can get an invoice', async () => {
    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/invoices/${invoice.id}`)

    expect(status).toEqual(200)
    expect(data.name).toEqual(`//localhost:3001/invoices/${invoice.id}`)
    expect(data.subject).toEqual('$wallet.example/alice')
    expect(data.amount).toEqual('500')
    expect(data.assetCode).toEqual('USD')
    expect(data.assetScale).toEqual(2)
    expect(data.description).toEqual('Test invoice')
    expect(data.received).toEqual('0')
  })
})
