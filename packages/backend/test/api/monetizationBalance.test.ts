import axios from 'axios'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account, Invoice, PaymentPointer } from '../../src/models'
import { Model } from 'objection'
import Knex, { Transaction } from 'knex'
import { identifierToPaymentPointer } from '../../src/utils'
import { mockAuth } from '../helpers/auth'

describe('Monetization', function () {
  let appContainer: TestAppContainer
  let trx: Transaction
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
    await appContainer.knex.migrate.latest()
  })

  beforeEach(async () => {
    trx = await appContainer.knex.transaction()
    Model.knex(trx as Knex)
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

  test('Get balance of current monetization invoice', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      limit: 0n
    })
    const invoice = await Invoice.query().insertAndFetch({
      assetCode: 'USD',
      assetScale: 6,
      subject: identifierToPaymentPointer('alice'),
      accountId: account.id,
      userId: user.id,
      description: 'Monetization',
      expiresAt: (new Date(Date.now() + 1 * 60 * 60 * 1000)).toISOString()
    })
    const paymentPointer = await PaymentPointer.query().insertAndFetch({
      userId: user.id,
      accountId: account.id,
      identifier: 'alice',
      name: 'default',
      currentMonetizationInvoiceId: invoice.id
    })
    await invoice.$query().patch({
      received: 1000n
    })

    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/users/me/monetizationbalance`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      balance: 1000
    })
  })

  test('Get balance of current monetization invoice if no invoice', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      limit: 0n
    })
    await PaymentPointer.query().insertAndFetch({
      userId: user.id,
      accountId: account.id,
      identifier: 'alice',
      name: 'default'
    })

    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/users/me/monetizationbalance`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      balance: 0
    })
  })

  test('Get balance of current monetization invoice if invoice expired', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      limit: 0n
    })
    const invoice = await Invoice.query().insertAndFetch({
      assetCode: 'USD',
      assetScale: 6,
      subject: identifierToPaymentPointer('alice'),
      accountId: account.id,
      userId: user.id,
      description: 'Monetization',
      expiresAt: (new Date(Date.now() - 1 * 60 * 60 * 1000)).toISOString()
    })
    const paymentPointer = await PaymentPointer.query().insertAndFetch({
      userId: user.id,
      accountId: account.id,
      identifier: 'alice',
      name: 'default',
      currentMonetizationInvoiceId: invoice.id
    })

    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/users/me/monetizationbalance`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data).toEqual({
      balance: 0
    })
  })
})
