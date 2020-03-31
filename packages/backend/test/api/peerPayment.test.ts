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
  mockAuth()

  beforeAll(async () => {
    appContainer = await createTestApp()
    await appContainer.knex.migrate.latest()
    nock('http://wallet.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/.well-known/open-payments')
      .reply(200, {
        issuer: 'http://wallet.com',
        invoices_endpoint: 'http://wallet.com/invoices'
      })
      .post('/invoices')
      .reply(201, {
        name: '//wallet.com/invoices/123',
        description: 'Payment',
        assetCode: 'USD',
        assetScale: 6,
        amount: null,
        subject: '$wallet.com/alice'
      })
      .options('/invoices/123')
      .reply(200, {
        ilpAddress: 'bob',
        sharedSecret: 'secret'
      })
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

  describe('Open Payments Peer Payment', () => {
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
        balance: 10000000n
      })
    })

    it('User can make an open payments peer payment', async () => {
      appContainer.streamService.sendMoney = jest.fn(async () => {
        return 1000000n
      })
      const response = await axios.post(`http://localhost:${appContainer.port}/payments/peer`, {
        accountId: account.id,
        amount: 1000000,
        type: 'open-payments',
        receiverPaymentPointer: '$wallet.com/alice'
      }, {
        headers: {
          authorization: `Bearer user_${user.id}`
        }
      }).then(resp => {
        return resp.data
      })

      account = await account.$query()
      expect(response).toEqual({
        sent: '1000000'
      })
      expect(account.balance).toEqual(9000000n)
    })
  })
})
