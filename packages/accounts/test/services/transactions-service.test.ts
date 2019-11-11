import { KnexAccountService } from '../../src/services/accounts-service'
import { KnexTransactionService, Transaction } from '../../src/services/transactions-service'
import Knex = require('knex')

describe('Accounts Services', () => {
  let knex: Knex
  let accountService: KnexAccountService
  let transactionsService: KnexTransactionService

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
        supportBigNumbers: true
      }
    })

    accountService = new KnexAccountService(knex)
    transactionsService = new KnexTransactionService(knex)
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await knex.migrate.rollback()
  })

  afterAll(async () => {
    await knex.destroy()
  })

  test('Can create a transaction adds transaction and adjusts accounts balance', async () => {
    let account = await accountService.add({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })

    await transactionsService.create(account.id, 100n)
    account = await accountService.get(account.id)

    const transaction = await knex<Transaction>('transactions').first()

    console.log(transaction)
    expect(transaction!.accountId).toEqual(account.id.toString())
    expect(transaction!.amount).toEqual('100')
    expect(account.balance.toString()).toBe('100')
  })

  test('Creating a transaction that makes limit get exceeded fails', async () => {
    let account = await accountService.add({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })

    const transactionPromise = transactionsService.create(account.id, -100n)

    await expect(transactionPromise).rejects.toEqual(new Error('New Balance exceeds limit'))

    account = await accountService.get(account.id)
    const transaction = await knex<Transaction>('transactions').first()

    expect(transaction).toBeUndefined()
    expect(account.balance.toString()).toBe('0')
  })

  test('Can get transactions for an account', async () => {
    const account1 = await accountService.add({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })
    const account2 = await accountService.add({
      userId: '2',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })
    const transactionPromises = []
    transactionPromises.push(transactionsService.create('1', 100n))
    transactionPromises.push(transactionsService.create('1', 100n))
    transactionPromises.push(transactionsService.create('2', 100n))

    await Promise.all(transactionPromises)

    const transactions = await transactionsService.get('1')

    expect(transactions.length).toBe(2)
    transactions.forEach(transaction => {
      expect(transaction.accountId).toBe('1')
      expect(transaction.amount.toString()).toBe('100')
    })
  })

  test('Can get aggregate transactions for an account', async () => {
    const account1 = await accountService.add({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })
    const transactionPromises = []
    transactionPromises.push(transactionsService.create('1', 100n))
    transactionPromises.push(transactionsService.create('1', 100n))
    transactionPromises.push(transactionsService.create('1', 100n))

    await Promise.all(transactionPromises)

    const transactions = await transactionsService.get('1', 1000)

    expect(transactions.length).toBe(1)
  })
})
