import axios from 'axios'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account, Invoice, PaymentPointer } from '../../src/models'
import { Model } from 'objection'
import Knex, { Transaction } from 'knex'
import { identifierToPaymentPointer } from '../../src/utils'

describe('Monetization', function () {
  let appContainer: TestAppContainer
  let trx: Transaction

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

  describe('Get', function () {
    test('returns the monetization details', async () => {
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

      const { data, status } = await axios.get(`http://localhost:${appContainer.port}/p/${user.username}`)

      expect(status).toEqual(200)
      expect(data.ilpAddress).toBeDefined()
      expect(data.sharedSecret).toBeDefined()
    })

    test('create a new invoice for monetization if current one has expired', async () => {
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

      const { data, status } = await axios.get(`http://localhost:${appContainer.port}/p/${user.username}`)

      const refreshedPaymentPointer = await paymentPointer.$query()
      expect(refreshedPaymentPointer.currentMonetizationInvoiceId).not.toEqual(invoice.id)
      expect(status).toEqual(200)
      expect(data.ilpAddress).toBeDefined()
      expect(data.sharedSecret).toBeDefined()
    })

    test('returns the monetization details for SPSP query', async () => {
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

      const { data, status } = await axios.get(`http://localhost:${appContainer.port}/p/${user.username}`, {
        headers: {
          Accept: 'application/spsp4+json'
        }
      })

      expect(status).toEqual(200)
      expect(data.destination_account).toBeDefined()
      expect(data.shared_secret).toBeDefined()
    })

    test('returns 404 for invalid username', async () => {
      try {
        await axios.get(`http://localhost:${appContainer.port}/p/drew`)
      } catch (error) {
        expect(error.response.status).toEqual(404)
        return
      }

      fail()
    })
  })
})
