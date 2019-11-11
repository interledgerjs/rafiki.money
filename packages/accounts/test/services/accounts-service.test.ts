import { DatabaseAccount, KnexAccountService } from '../../src/services/accounts-service'
import Knex = require('knex')

describe('Accounts Services', () => {
  let knex: Knex
  let accountService: KnexAccountService

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
        supportBigNumbers: true
      }
    })

    accountService = new KnexAccountService(knex)
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

  test('Can get an account', async () => {
    const id = await knex<DatabaseAccount>('accounts').insert({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: '0',
      balance: '0'
    }).then(result => String(result[0]))

    const account = await accountService.get(id)
    expect(account.name).toEqual('Test Account')
    expect(account.userId).toEqual('1')
    expect(account.assetCode).toEqual('USD')
    expect(account.assetScale).toEqual(2)
    expect(account.limit.toString()).toEqual(BigInt(0).toString())
    expect(account.balance.toString()).toEqual(BigInt(0).toString())
  })

  test('Can add an account', async () => {
    const insertedAccount = await accountService.add({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: 0n
    })

    const account = await accountService.get(insertedAccount.id)

    expect(account.name).toEqual('Test Account')
    expect(account.userId).toEqual('1')
    expect(account.assetCode).toEqual('USD')
    expect(account.assetScale).toEqual(2)
    expect(account.limit.toString()).toEqual(BigInt(0).toString())
    expect(account.balance.toString()).toEqual(BigInt(0).toString())
  })

  test('Can update an account', async () => {
    const id = await knex<DatabaseAccount>('accounts').insert({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: '0',
      balance: '0'
    }).then(result => String(result[0]))

    const account = await accountService.update(id, {
      userId: '1',
      name: 'Test2 Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: -100n
    })

    expect(account.name).toEqual('Test2 Account')
    expect(account.userId).toEqual('1')
    expect(account.assetCode).toEqual('USD')
    expect(account.assetScale).toEqual(2)
    expect(account.limit.toString()).toEqual(BigInt(-100).toString())
    expect(account.balance.toString()).toEqual(BigInt(0).toString())
  })

  test('Can get accounts by userId', async () => {
    await knex<DatabaseAccount>('accounts').insert({
      userId: '1',
      name: 'Test Account',
      assetCode: 'USD',
      assetScale: 2,
      limit: '0',
      balance: '0'
    }).then(result => String(result[0]))
    await knex<DatabaseAccount>('accounts').insert({
      userId: '2',
      name: 'Test Account 2',
      assetCode: 'USD',
      assetScale: 2,
      limit: '0',
      balance: '0'
    }).then(result => String(result[0]))

    const accounts = await accountService.getByUserId('1')

    const account = accounts[0]
    expect(accounts.length).toBe(1)
    expect(account.userId).toBe('1')
    expect(account.name).toBe('Test Account')
  })
})
