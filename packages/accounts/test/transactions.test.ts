import Koa from 'koa'
import axios from 'axios'
import { createApp } from '../src/app'
import { Server } from 'http'
import { KnexAccountService } from '../src/services/accounts-service'
import { KnexTransactionService } from '../src/services/transactions-service'
import createLogger from 'pino'
import { HydraApi, TokenInfo } from '../src/apis/hydra'
import Knex = require('knex')

describe('Transactions API Test', () => {
  let server: Server
  let port: number
  let app: Koa
  let knex: Knex
  let accountsService: KnexAccountService
  let transactionsService: KnexTransactionService
  let hydraApi: HydraApi

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:'
      }
    })
    accountsService = new KnexAccountService(knex)
    transactionsService = new KnexTransactionService(knex)
    hydraApi = {
      introspectToken: async (token) => {
        if (token === 'user1token') {
          return {
            sub: '1',
            active: true
          } as TokenInfo
        } else if (token === 'user2token') {
          return {
            sub: '2',
            active: true
          } as TokenInfo
        } else if (token === 'usersServiceToken') {
          return {
            sub: 'users-service',
            active: true
          } as TokenInfo
        } else {
          throw new Error('Getting Token failed')
        }
      }
    }

    app = createApp({
      accountsService,
      transactionsService,
      logger: createLogger(),
      hydraApi
    })
    server = app.listen(0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    port = server.address().port
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await knex.migrate.rollback()
  })

  afterAll(() => {
    server.close()
    knex.destroy()
  })

  describe('Create a transaction', () => {
    let account: any
    beforeEach(async () => {
      account = await accountsService.add({
        assetCode: 'XRP',
        assetScale: 6,
        limit: 0n,
        name: 'Test',
        userId: '1'
      })
    })

    it('Allowed Service can add a transaction to an account', async () => {
      const response = await axios.post(`http://localhost:${port}/transactions`, {
        accountId: account.id,
        amount: '100'
      }
      , {
        headers: {
          authorization: 'Bearer usersServiceToken'
        }
      }).then(resp => {
        expect(resp.status).toBe(201)
        return resp.data
      })

      const acc = await accountsService.get(account.id)
      expect(acc.balance.toString()).toBe('100')
    })

    it('User cant add a transaction for an account', async () => {
      const response = axios.post(`http://localhost:${port}/transactions`, {
        accountId: account.id,
        amount: '100'
      }
      , {
        headers: {
          authorization: 'Bearer user1token'
        }
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 404'))
    })
  })

  describe('Getting a transaction for account', () => {
    let account: any
    beforeEach(async () => {
      account = await accountsService.add({
        assetCode: 'XRP',
        assetScale: 6,
        limit: 0n,
        name: 'Test',
        userId: '1'
      })
      await transactionsService.create(account.id, 100n)
    })

    it('Allowed Service can get accounts transactions', async () => {
      const response = await axios.get(`http://localhost:${port}/transactions?accountId=${account.id}`
        , {
          headers: {
            authorization: 'Bearer usersServiceToken'
          }
        }).then(resp => {
        expect(resp.status).toBe(200)
        return resp.data
      })

      expect(response.length).toBe(1)
      expect(response[0].amount).toBe('100')
      expect(response[0].accountId).toBe(account.id.toString())
    })

    it('User can get own accounts transactions', async () => {
      const response = await axios.get(`http://localhost:${port}/transactions?accountId=${account.id}`
        , {
          headers: {
            authorization: 'Bearer user1token'
          }
        }).then(resp => {
        expect(resp.status).toBe(200)
        return resp.data
      })

      expect(response.length).toBe(1)
      expect(response[0].amount).toBe('100')
      expect(response[0].accountId).toBe(account.id.toString())
    })

    it('User cant get someone elses accounts transactions', async () => {
      const response = axios.get(`http://localhost:${port}/transactions?accountId=${account.id}`
        , {
          headers: {
            authorization: 'Bearer user2token'
          }
        })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })
})
