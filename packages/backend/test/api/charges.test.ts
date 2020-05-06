import { Transaction as KnexTransaction } from 'knex'
import { Model } from 'objection'
import axios from 'axios'
import { v4 } from 'uuid'
import { TestAppContainer, createTestApp } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { User, Account, Charge, Mandate, Transaction } from '../../src/models'
import { MandateTransaction } from '../../src/models/mandateTransaction'

describe('Charges API', () => {
  let appContainer: TestAppContainer
  let trx: KnexTransaction
  let mandate: Mandate
  let user: User
  let account: Account

  beforeAll(async () => {
    appContainer = createTestApp()
    await appContainer.knex.migrate.latest()
  })

  beforeEach(async () => {
    trx = await appContainer.knex.transaction()
    Model.knex(trx)
    user = await User.query().insert({ username: 'alice' })
    account = await user.$relatedQuery<Account>('accounts').insertAndFetch({ name: 'test', assetCode: 'USD', assetScale: 2, limit: 0n, balance: 20000n })
    mandate = await Mandate.query().insertAndFetch({ userId: user.id, accountId: account.id, amount: 10000n, assetCode: 'USD', assetScale: 2 })
    await mandate.$query().patch({ balance: 10000n })
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

  test('creates charge against mandate', async () => {
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    appContainer.streamService.sendMoney = jest.fn().mockResolvedValue(1000n)
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toBe(201)
    expect((await mandate.$relatedQuery<Charge>('charges').first().throwIfNotFound()).invoice).toBe('//acquirer.wallet/invoices/123')
  })

  test('uses stream service to perform payment and creates transaction against users account', async () => {
    expect((await account.$query()).balance.toString()).toBe('20000')
    expect((await mandate.$query()).balance.toString()).toBe('10000')
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    appContainer.streamService.sendMoney = jest.fn().mockResolvedValue(1000n)
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toBe(201)
    expect(appContainer.streamService.sendMoney).toHaveBeenCalledWith('test.rafiki.wallet.123', 'secret', '1000')
    expect((await account.$query()).balance.toString()).toBe('19000')
    expect((await mandate.$query()).balance.toString()).toBe('9000')
    expect(await account.$relatedQuery<Transaction>('transactions').first()).toMatchObject({ amount: -1000n })
  })

  test('does not process charge if a charge with the same invoice already exists', async () => {
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    appContainer.streamService.sendMoney = jest.fn().mockResolvedValue(1000n)
    const charge = await Charge.query().insert({ mandateId: mandate.id, invoice: chargeInfo.invoice })
    await mandate.$relatedQuery<Charge>('charges').insert({ invoice: chargeInfo.invoice })
    const interval = await mandate.currentInterval()
    await account.$relatedQuery<Transaction>('transactions').insert({ amount: 1000n, description: 'Payment for ' + chargeInfo.invoice })
    await mandate.$relatedQuery<MandateTransaction>('transactions').insert({ accountId: account.id, chargeId: charge.id, amount: -1000n, mandateIntervalId: interval.id})
    await mandate.$query().patch({ balance: 9000n })
    await account.$query().patch({ balance: 19000n })

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toBe(201)
    expect(appContainer.streamService.sendMoney).not.toHaveBeenCalled()
    expect(axios.options).not.toHaveBeenCalled()
    expect(axios.get).not.toHaveBeenCalled()
    expect((await account.$query()).balance.toString()).toBe('19000')
    expect((await mandate.$query()).balance.toString()).toBe('9000')
    expect(await account.$relatedQuery<Transaction>('transactions')).toHaveLength(1)
  })

  test('returns 401 if mandate belongs to a different user', async () => {
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }
    const otherUser = await User.query().insert({ username: 'bob' })

    const status = axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${otherUser.id}`
      }
    }).catch(error => error.response.status)

    await expect(status).resolves.toBe(401)
  })

  test('returns 401 if token is not authorized to charge mandate', async () => {
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const status = axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response.status)

    await expect(status).resolves.toBe(401)
  })

  test('returns 401 if token is not linked to mandate', async () => {
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        '//localhost/mandates/321'
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const status = axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response.status)

    await expect(status).resolves.toBe(401)
  })

  test('returns 404 if mandate does not exist', async () => {
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        '//localhost/mandates/321'
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const status = axios.post(`http://localhost:${appContainer.port}/mandates/${v4()}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response.status)

    await expect(status).resolves.toBe(404)
  })

  test('returns 500 if account does not have sufficient liquidity', async () => {
    const account = await user.$relatedQuery<Account>('accounts').insertAndFetch({ name: 'insufficient balance', assetCode: 'USD', assetScale: 2, limit: 20000n, balance: 0n })
    const mandate = await Mandate.query().insertAndFetch({ userId: user.id, accountId: account.id, amount: 10000n, assetCode: 'USD', assetScale: 2 })
    await mandate.$query().patch({ balance: 10000n })
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response)

    expect(status).toBe(500)
    expect((await mandate.$relatedQuery<Charge>('charges')).length).toBe(0)
    expect((await mandate.$relatedQuery<MandateTransaction>('transactions')).length).toBe(0)
    expect((await account.$relatedQuery<Transaction>('transactions')).length).toBe(0)
    expect((await mandate.$query()).balance).toBe(10000n)
    expect((await account.$query()).balance).toBe(0n)
  })

  test('returns 500 if mandate does not have sufficient liquidity', async () => {
    const mandate = await Mandate.query().insertAndFetch({ userId: user.id, accountId: account.id, amount: 10000n, assetCode: 'USD', assetScale: 2 })
    await mandate.$query().patch({ balance: 0n })
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response)

    expect(status).toBe(500)
    expect((await mandate.$relatedQuery<Charge>('charges')).length).toBe(0)
    expect((await mandate.$relatedQuery<MandateTransaction>('transactions')).length).toBe(0)
    expect((await account.$relatedQuery<Transaction>('transactions')).length).toBe(0)
    expect((await mandate.$query()).balance).toBe(0n)
    expect((await account.$query()).balance).toBe(20000n)
  })

  test('reverses difference if amount sent is less than that of invoice', async () => {
    const mandate = await Mandate.query().insertAndFetch({ userId: user.id, accountId: account.id, amount: 10000n, assetCode: 'USD', assetScale: 2 })
    await mandate.$query().patch({ balance: 0n })
    axios.options = jest.fn().mockResolvedValue({ data: { sharedSecret: 'secret', ilpAddress: 'test.rafiki.wallet.123' } })
    axios.get = jest.fn().mockResolvedValue({ data: { assetCode: 'USD', assetScale: 2, amount: '1000' } })
    appContainer.streamService.sendMoney = jest.fn().mockResolvedValue(499n)
    mockAuth([{
      type: 'open_payments_mandate',
      locations: [
        mandate.toJSON().name
      ],
      actions: [
        'read', 'charge'
      ]
    }])
    const chargeInfo = { invoice: '//acquirer.wallet/invoices/123' }

    const { status } = await axios.post(`http://localhost:${appContainer.port}/mandates/${mandate.id}/charges`, chargeInfo, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).catch(error => error.response)

    expect(status).toBe(500)
    expect((await mandate.$relatedQuery<Charge>('charges')).length).toBe(0)
    expect((await mandate.$relatedQuery<MandateTransaction>('transactions')).length).toBe(0)
    expect((await account.$relatedQuery<Transaction>('transactions')).length).toBe(0)
    expect((await mandate.$query()).balance).toBe(0n)
    expect((await account.$query()).balance).toBe(20000n)
  })

  test.todo('converts between asset scale of mandate and invoice')
})
