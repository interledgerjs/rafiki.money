import Knex from 'knex'
import axios from 'axios'
import createLogger from 'pino'
import { App } from '../../src/app'
import { refreshDatabase } from '../helpers/db'
import { hydra } from '../../src/services/hydra'
import { accounts } from '../../src/services/accounts'
import { getAgreementUrlFromScopes } from '../../src/controllers/consentController'
import { TokenService } from '../../src/services/token-service'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'

describe('Consent', function () {
  let appContainer: TestAppContainer
  let user: User
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.rollback()
    await appContainer.knex.migrate.latest()
    user = await User.query().insert({
      username: 'albert'
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  describe('getAgreementUrlFromScopes', function () {
    test('returns id for valid mandates url', async () => {
      const scopes = ['offline', 'openid', 'mandates.aef-123']

      const url = getAgreementUrlFromScopes(scopes)

      expect(url).toEqual('http://localhost:3001/mandates/aef-123')
    })

    test('returns id for valid intents url', async () => {
      const scopes = ['offline', 'openid', 'intents.aef-123']

      const url = getAgreementUrlFromScopes(scopes)

      expect(url).toEqual('http://localhost:3001/intents/aef-123')
    })

    test('returns undefined if invalid agreements url', async () => {
      const scopes = ['offline', 'openid']

      const url = getAgreementUrlFromScopes(scopes)

      expect(url).toBeUndefined()
    })
  })

  describe('Get consent request', function () {
    test('returns agreementUrl, user, accounts, client and requested_scope if scopes contain intent', async () => {
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ skip: false, subject: user.id.toString(), client: 'test-client', requested_scope: ['offline', 'openid', 'intents'] })

      const { status, data } = await axios.get(`http://localhost:${appContainer.port}/consent?consent_challenge=test`)

      expect(status).toEqual(200)
      expect(hydra.getConsentRequest).toHaveBeenCalled()
      expect(data).toEqual({
        requestedScopes: ['offline', 'openid', 'intents'],
        client: 'test-client',
        user: user.id.toString()
      })
    })

    test('returns client, user and requested_scope if scope isn\'t for mandate/intent', async () => {
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ skip: false, subject: user.id.toString(), client: 'test-client', requested_scope: ['offline', 'openid'] })
      accounts.getUserAccounts = jest.fn()

      const { status, data } = await axios.get(`http://localhost:${appContainer.port}/consent?consent_challenge=test`)

      expect(status).toEqual(200)
      expect(hydra.getConsentRequest).toHaveBeenCalled()
      expect(accounts.getUserAccounts).not.toHaveBeenCalled()
      expect(data).toEqual({
        requestedScopes: ['offline', 'openid'],
        client: 'test-client',
        user: user.id.toString()
      })
    })
  })

  describe('Post consent', function () {
    test('gives consent if user accepts and returns redirectTo', async () => {
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ requested_access_token_audience: 'test', subject: user.id.toString(), scopes: ['offline', 'openid'] })
      hydra.acceptConsentRequest = jest.fn().mockResolvedValue({ redirect_to: 'http://localhost:9010/callback' })

      const { status, data } = await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: true, scopes: ['offline', 'openid'] })

      expect(status).toEqual(200)
      expect(data).toEqual({ redirectTo: 'http://localhost:9010/callback' })
      expect(hydra.getConsentRequest).toHaveBeenCalled()
      expect(hydra.acceptConsentRequest).toHaveBeenCalledWith('testChallenge', {
        remember: true,
        remember_for: 0,
        grant_scope: ['offline', 'openid'],
        grant_access_token_audience: 'test',
        session: {
          access_token: {},
          id_token: {}
        }
      })
    })

    test('rejects consent if user denies, accepts posted as boolean', async () => {
      hydra.rejectConsentRequest = jest.fn().mockResolvedValue({
        redirect_to: 'http://localhost:9010/errorCallback'
      })

      const { status, data } = await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: false, scopes: ['offline', 'openid'] })

      expect(status).toEqual(200)
      expect(data).toEqual({ redirectTo: 'http://localhost:9010/errorCallback' })
      expect(hydra.rejectConsentRequest).toHaveBeenCalledWith('testChallenge', {
        error: 'access_denied',
        error_description: 'The resource owner denied the request'
      })
    })

    test('rejects consent if user denies, accepts posted as string', async () => {
      hydra.rejectConsentRequest = jest.fn().mockResolvedValue({
        redirect_to: 'http://localhost:9010/errorCallback'
      })

      const { status, data } = await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: false, scopes: ['offline', 'openid'] })

      expect(status).toEqual(200)
      expect(data).toEqual({ redirectTo: 'http://localhost:9010/errorCallback' })
      expect(hydra.rejectConsentRequest).toHaveBeenCalledWith('testChallenge', {
        error: 'access_denied',
        error_description: 'The resource owner denied the request'
      })
    })

    test('returns 401 if mandates scope is set and it doesn\'t match the logged in users payment pointer', async () => {
      // scenario: bob has logged in and is trying to give consent to a mandate that is scoped to alice's payment pointer
      const bob = await User.query().insertAndFetch({ username: 'bob', password: 'test' })
      const mandate = { id: 'aef-123', scope: '$rafiki.money/p/alice' }
      axios.get = jest.fn().mockResolvedValue({ data: mandate })
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ requested_access_token_audience: 'test', subject: bob.id.toString(), scopes: ['offline', 'openid'] })

      try {
        await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: true, accountId: 1, scopes: ['offline', 'openid', 'mandates.aef-123'] })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        expect(error.response.data).toEqual('You are not allowed to give consent to this agreement.')
        return
      }

      fail()
    })

    // TODO Update
    // test('binds accountId, userId and scope to agreement if user gives consent for mandate', async () => {
    //   const updatedAgreement = { id: 'aef-123', userId: user.id.toString(), accountId: 1, scope: '$rafiki.money/p/alice' }
    //   hydra.getConsentRequest = jest.fn().mockResolvedValue({ requested_access_token_audience: 'test', subject: user.id.toString(), scopes: ['offline', 'openid'] })
    //   hydra.acceptConsentRequest = jest.fn().mockResolvedValue({ redirect_to: 'http://localhost:9010/callback' })
    //   axios.patch = jest.fn().mockResolvedValue({ data: updatedAgreement })
    //
    //   const { status, data } = await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: true, accountId: 1, scopes: ['offline', 'openid', 'mandates.aef-123'] })
    //
    //   expect(status).toEqual(200)
    //   expect(data).toEqual({ redirectTo: 'http://localhost:9010/callback' })
    //   expect(hydra.getConsentRequest).toHaveBeenCalled()
    //   expect(axios.patch).toHaveBeenCalledWith('http://localhost:3001/mandates/aef-123', { accountId: 1, userId: user.id.toString(), scope: '$rafiki.money/p/alice' })
    //   expect(hydra.acceptConsentRequest).toHaveBeenCalledWith('testChallenge', {
    //     remember: true,
    //     remember_for: 0,
    //     grant_scope: ['offline', 'openid', 'mandates.aef-123'],
    //     grant_access_token_audience: 'test',
    //     session: {
    //       access_token: {
    //         interledger: {
    //           agreement: updatedAgreement
    //         }
    //       },
    //       id_token: {
    //         interledger: {
    //           agreement: updatedAgreement
    //         }
    //       }
    //     }
    //   })
    // })
    //
    // test('binds accountId and userId to agreement if user gives consent for intent', async () => {
    //   const updatedIntent = { id: 'aef-123', userId: user.id.toString(), accountId: 1 }
    //   hydra.getConsentRequest = jest.fn().mockResolvedValue({ requested_access_token_audience: 'test', subject: user.id.toString(), scopes: ['offline', 'openid'] })
    //   hydra.acceptConsentRequest = jest.fn().mockResolvedValue({ redirect_to: 'http://localhost:9010/callback' })
    //   axios.patch = jest.fn().mockResolvedValue({ data: updatedIntent })
    //
    //   const { status, data } = await axios.post('http://localhost:3000/consent?consent_challenge=testChallenge', { accepts: true, accountId: 1, scopes: ['offline', 'openid', 'intents.aef-123'] })
    //
    //   expect(status).toEqual(200)
    //   expect(data).toEqual({ redirectTo: 'http://localhost:9010/callback' })
    //   expect(hydra.getConsentRequest).toHaveBeenCalled()
    //   expect(axios.patch).toHaveBeenCalledWith('http://localhost:3001/intents/aef-123', { accountId: 1, userId: user.id.toString() })
    //   expect(hydra.acceptConsentRequest).toHaveBeenCalledWith('testChallenge', {
    //     remember: true,
    //     remember_for: 0,
    //     grant_scope: ['offline', 'openid', 'intents.aef-123'],
    //     grant_access_token_audience: 'test',
    //     session: {
    //       access_token: {
    //         interledger: {
    //           agreement: updatedIntent
    //         }
    //       },
    //       id_token: {
    //         interledger: {
    //           agreement: updatedIntent
    //         }
    //       }
    //     }
    //   })
    // })
  })
})
