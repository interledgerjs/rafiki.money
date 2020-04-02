import axios from 'axios'
import Knex from 'knex'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account } from '../../src/models/account'
import { mockAuth } from '../helpers/auth'
import { User } from '../../src/models/user'
import { Transaction } from 'knex'
import { Model } from 'objection'
import { Transaction as AccountTransaction } from '../../src/models'

describe('Accounts API Test', () => {
  let appContainer: TestAppContainer
  let trx: Transaction
  mockAuth()

  beforeAll(async () => {
    appContainer = await createTestApp()
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
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  describe('Getting an Accounts Transactions', () => {
    let account: Account
    let user: User

    beforeEach(async () => {
      user = await User.query().insert({
        username: 'alice'
      })
      account = await Account.query().insertAndFetch({
        userId: user.id,
        name: 'Test',
        assetCode: 'USD',
        assetScale: 6,
        limit: 0n,
        balance: 0n
      })
      await AccountTransaction.query().insert({
        accountId: account.id,
        amount: 1000000n
      })
    })

    it('User can get their own account transaction', async () => {
      const response = await axios.get(`http://localhost:${appContainer.port}/accounts/${account.id}/transactions`, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      const transaction = response[0]
      expect(transaction).toBeDefined()
      expect(transaction.accountId).toEqual(account.id)
    })

    it('User cant get someone elses transactions', async () => {
      const bob = await User.query().insert({
        username: 'bob'
      })
      const response = axios.get(`http://localhost:${appContainer.port}/accounts/${account.id}`, {
        headers: {
          authorization: `Bearer user_${bob.id}`
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })
})
