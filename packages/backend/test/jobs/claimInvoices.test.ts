import axios from 'axios'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account, Invoice, PaymentPointer } from '../../src/models'
import { Model } from 'objection'
import Knex, { Transaction } from 'knex'
import { identifierToPaymentPointer } from '../../src/utils'
import { claimInvoices } from '../../src/jobs/claimInvoicesJob'

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

  test('Transfers invoices that are expired to users balance', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      balance: 0n,
      limit: 0n
    })
    const invoice = await Invoice.query().insertAndFetch({
      accountId: account.id,
      userId: user.id,
      assetScale: 6,
      assetCode: 'USD',
      subject: 'test',
      amount: 1000n,
      expiresAt: new Date(Date.now() - 1).toISOString()
    })
    await invoice.$query().patch({
      received: 1000n
    })

    await claimInvoices()

    const refreshedAccount = await account.$query()
    const refreshedInvoice = await invoice.$query()
    const accountTransaction = await account.$relatedQuery('transactions').first()
    expect(refreshedAccount.balance).toEqual(1000n)
    expect(accountTransaction.amount).toEqual(1000n)
    expect(accountTransaction.description).toContain(invoice.id)
    expect(refreshedInvoice.finalizedAt).toBeDefined()
  })

  test('Does not transfer invoices that are expired and finalized to users balance', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      balance: 0n,
      limit: 0n
    })
    const invoice = await Invoice.query().insertAndFetch({
      accountId: account.id,
      userId: user.id,
      assetScale: 6,
      assetCode: 'USD',
      subject: 'test',
      amount: 1000n,
      expiresAt: new Date(Date.now() - 1).toISOString(),
      finalizedAt: new Date().toISOString()
    })
    await invoice.$query().patch({
      received: 1000n
    })

    await claimInvoices()

    const refreshedAccount = await account.$query()
    const accountTransaction = await account.$relatedQuery('transactions').first()
    expect(refreshedAccount.balance).toEqual(0n)
    expect(accountTransaction).toBeUndefined()
  })

  test('Does not transfer invoices that are not expired', async () => {
    const user = await User.query().insertAndFetch({ username: 'alice' })
    const account = await Account.query().insertAndFetch({
      name: 'main',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 6,
      balance: 0n,
      limit: 0n
    })
    const invoice = await Invoice.query().insertAndFetch({
      accountId: account.id,
      userId: user.id,
      assetScale: 6,
      assetCode: 'USD',
      subject: 'test',
      amount: 1000n
    })
    await invoice.$query().patch({
      received: 1000n
    })

    await claimInvoices()

    const refreshedAccount = await account.$query()
    const accountTransaction = await account.$relatedQuery('transactions').first()
    expect(refreshedAccount.balance).toEqual(0n)
    expect(accountTransaction).toBeUndefined()
  })
})
