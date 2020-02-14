import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { Invoice } from '../../src/models/invoice'
import { User } from '../../src/models/user'

describe('Create invoice', () => {
  let appContainer: TestAppContainer
  let user: User
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
    user = await User.query().insert({
      username: 'alice'
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  test('can create invoice', async () => {
    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/invoices`, {
      description: 'Test invoice',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500'
    }, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(201)
    expect(data.amount).toEqual('500')

    const invoice = await Invoice.query().findById(data.id)
    expect(invoice).toBeDefined()
    expect(invoice!.amount).toEqual(500n)
    expect(invoice!.description).toEqual('Test invoice')
    expect(invoice!.assetCode).toEqual('USD')
    expect(invoice!.assetScale).toEqual(2)
  })
})

describe('Get an invoice', () => {
  let appContainer: TestAppContainer
  let user: User
  let invoice: Invoice
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
    user = await User.query().insert({
      username: 'alice'
    })
    invoice = await Invoice.query().insert({
      description: 'Test invoice',
      assetScale: 2,
      assetCode: 'USD',
      amount: 500n,
      balance: 0n
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  test('Can get an invoice', async () => {
    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/invoices/${invoice.id}`, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.id).toEqual(invoice.id)
    expect(data.amount).toEqual('500')
  })
})
