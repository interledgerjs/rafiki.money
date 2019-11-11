import Koa from 'koa'
import axios from 'axios'
import { createApp } from '../src/app'
import { Server } from 'http'
import { KnexAccountService } from '../src/services/accounts-service'
import { KnexTransactionService } from '../src/services/transactions-service'
import createLogger from 'pino'
import { HydraApi, TokenInfo } from '../src/apis/hydra'
import Knex = require('knex')

describe('Accounts API Test', () => {
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
        } else if (token === 'user3token') {
          return {
            sub: '3',
            active: false
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

  describe('Creating Account', () => {
    test('Can create an account if valid user', async () => {
      const response = await axios.post(`http://localhost:${port}/accounts`, {
        name: 'test'
      }, {
        headers: {
          authorization: 'Bearer user1token'
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.userId).toBe('1')
      expect(response.name).toBe('test')
    })

    test('Cant create an account if invalid user', async () => {
      const response = axios.post(`http://localhost:${port}/accounts`, {
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

    it('User can update their own account', async () => {
      const response = await axios.patch(`http://localhost:${port}/accounts/${account.id}`, {
        name: 'new test'
      }, {
        headers: {
          authorization: 'Bearer user1token'
        }
      }).then(resp => {
        return resp.data
      })

      const edittedAccount = await accountsService.get(account.id)

      expect(edittedAccount.name).toBe('new test')
    })

    it('User cant update another users account', async () => {
      const response = axios.patch(`http://localhost:${port}/accounts/${account.id}`, {
        name: 'new test'
      }, {
        headers: {
          authorization: 'Bearer user2token'
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })

  describe('Getting an Account', () => {
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

    it('User can get their own account', async () => {
      const response = await axios.get(`http://localhost:${port}/accounts/${account.id}`, {
        headers: {
          authorization: 'Bearer user1token'
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.name).toBe('Test')
    })

    it('User cant get someone elses account', async () => {
      const response = axios.get(`http://localhost:${port}/accounts/${account.id}`, {
        headers: {
          authorization: 'Bearer user2token'
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })

  describe('Getting all user accounts', () => {
    beforeEach(async () => {
      await accountsService.add({
        assetCode: 'XRP',
        assetScale: 6,
        limit: 0n,
        name: 'Test',
        userId: '1'
      })
      await accountsService.add({
        assetCode: 'XRP',
        assetScale: 6,
        limit: 0n,
        name: 'Test 2',
        userId: '1'
      })
    })

    it('User can get their own accounts', async () => {
      const response = await axios.get(`http://localhost:${port}/accounts?userId=1`, {
        headers: {
          authorization: 'Bearer user1token'
        }
      }).then(resp => {
        return resp.data
      })

      expect(response.length).toBe(2)
      response.forEach((account: any) => {
        expect(account.userId).toBe('1')
      })
    })

    it('User cant get someone elses account', async () => {
      const response = axios.get(`http://localhost:${port}/accounts?userId=1`, {
        headers: {
          authorization: 'Bearer user2token'
        }
      }).then(resp => {
        return resp.data
      })

      await expect(response).rejects.toEqual(Error('Request failed with status code 403'))
    })
  })
})
