import axios from 'axios'
import { default as Knex, Transaction } from 'knex'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account } from '../../src/models/account'
import { mockAuth } from '../helpers/auth'
import { User } from '../../src/models/user'

import { Model } from 'objection'
import nock from 'nock'

describe('User Peer Payment API Test', () => {
  let appContainer: TestAppContainer
  let trx: Transaction
  let account: Account
  let user: User
  mockAuth()

  beforeAll(async () => {
    appContainer = await createTestApp()
    await appContainer.knex.migrate.latest()
  })

  beforeEach(async () => {
    trx = await appContainer.knex.transaction()
    Model.knex(trx as Knex)
    user = await User.query().insert({
      username: 'alice'
    })
    account = await Account.query().insertAndFetch({
      userId: user.id,
      name: 'Test',
      assetCode: 'USD',
      assetScale: 6,
      limit: 0n,
      balance: 10000000n
    })
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
  })

  afterAll(async () => {
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  test('Can get a users total balance', async () => {
    const response = await axios.get(`http://localhost:${appContainer.port}/users/me/balance`, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    }).then(resp => {
      return resp.data
    })

    expect(response).toEqual({
      balance: '10000000'
    })
  })
})
