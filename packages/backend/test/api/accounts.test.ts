import axios from 'axios'
import Knex from 'knex'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account } from '../../src/models/account'
import { mockAuth } from '../helpers/auth'
import { User } from '../../src/models/user'
import { Transaction } from 'knex'
import { Model } from 'objection'

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
    await appContainer.knex.migrate.rollback()
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  describe('Creating Account', () => {
    test('Can create an account if valid user', async () => {
      const user = await User.query().insert({
        username: 'alice1'
      })
      const response = await axios.post(`http://localhost:${appContainer.port}/accounts`, {
        name: 'test'
      }, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.userId).toBe(user.id)
      expect(response.name).toBe('test')
    })

    test('Cant create an account if invalid user', async () => {
      const response = axios.post(`http://localhost:${appContainer.port}/accounts`, {
        name: 'test'
      }, {
        headers: {
          authorization: 'Bearer user3token'
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 401'))
    })
  })

  describe('Updating Account', () => {
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
    })

    it('User can update their own account', async () => {
      const response = await axios.patch(`http://localhost:${appContainer.port}/accounts/${account.id}`, {
        name: 'new test'
      }, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      const updatedAccount = await Account.query().findById(account.id)

      expect(updatedAccount!.name).toBe('new test')
    })

    it('User cant update another users account', async () => {
      const bob = await User.query().insert({
        username: 'bob'
      })
      const response = axios.patch(`http://localhost:${appContainer.port}/accounts/${account.id}`, {
        name: 'new test'
      }, {
        headers: {
          authorization: `Bearer user_${bob.id}`
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })

  describe('Getting an Account', () => {
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
    })

    it('User can get their own account', async () => {
      const response = await axios.get(`http://localhost:${appContainer.port}/accounts/${account.id}`, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.name).toBe('Test')
    })

    it('User cant get someone elses account', async () => {
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

  describe('Getting all user accounts', () => {
    let user: User

    beforeEach(async () => {
      user = await User.query().insert({
        username: 'alice'
      })
      await Account.query().insertAndFetch({
        userId: user.id,
        name: 'Test',
        assetCode: 'USD',
        assetScale: 6,
        limit: 0n,
        balance: 0n
      })
      await Account.query().insertAndFetch({
        userId: user.id,
        name: 'Test 2',
        assetCode: 'USD',
        assetScale: 6,
        limit: 0n,
        balance: 0n
      })
    })

    it('User can get their own accounts', async () => {
      const response = await axios.get(`http://localhost:${appContainer.port}/accounts?userId=${user.id}`, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.length).toBe(2)
      response.forEach((account: any) => {
        expect(account.userId).toBe(user.id)
      })
    })

    it('User cant get someone elses account', async () => {
      const bob = await User.query().insert({
        username: 'bob'
      })
      const response = axios.get(`http://localhost:${appContainer.port}/accounts?userId=1`, {
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
