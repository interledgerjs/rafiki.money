import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { hydra } from '../../src/services/hydra'
import { Account } from '../../src/models/account'

describe('Faucet API Test', () => {
  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
    hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {
      if (token === 'user1token') {
        return {
          active: true,
          scope: 'offline openid',
          sub: '1',
          token_type: 'access_token'
        }
      }

      if (token === 'user2token') {
        return {
          active: true,
          scope: 'offline openid',
          sub: '2',
          token_type: 'access_token'
        }
      }

      return {
        active: false
      }
    })
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  describe('Add from faucet', () => {
    let account: Account
    beforeEach(async () => {
      account = await Account.query().insert({
        assetCode: 'XRP',
        assetScale: 6,
        limit: 0n,
        name: 'Test',
        userId: 1
      })
    })

    it('User can add money via fuacet', async () => {
      const response = await axios.post(`http://localhost:${appContainer.port}/faucet`, {
        accountId: account.id
      }
      , {
        headers: {
          authorization: 'Bearer user1token'
        }
      }).then(resp => {
        expect(resp.status).toBe(201)
        return resp.data
      })

      const acc = await Account.query().findById(account.id)
      const transactions = await acc.$relatedQuery('transactions')
      const transaction = transactions[0]
      expect(acc!.balance).toEqual(100000000n)
      expect(transactions.length).toEqual(1)
      expect(transaction.accountId).toEqual(acc.id)
      expect(transaction.amount).toEqual(100000000n)
    })

    it('User cant add a transaction for an account not theirs', async () => {
      const response = axios.post(`http://localhost:${appContainer.port}/transactions`, {
        accountId: account.id,
        amount: '100'
      }
      , {
        headers: {
          authorization: 'Bearer user2token'
        }
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 404'))
    })
  })
})
