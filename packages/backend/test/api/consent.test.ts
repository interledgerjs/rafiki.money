import axios from 'axios'
import { hydra } from '../../src/services/hydra'
import { accounts } from '../../src/services/accounts'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { Account } from '../../src/models/account'
import { Mandate } from '../../src/models/mandate'

describe('Consent', function () {
  let appContainer: TestAppContainer
  let user: User
  let account: Account
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
    account = await Account.query().insert({
      name: 'Main',
      assetCode: 'USD',
      assetScale: 6,
      userId: user.id,
      limit: 0n
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  describe('Get consent request', function () {
    test('returns client, user and requested_scope', async () => {
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ skip: false, subject: user.id.toString(), client: 'test-client', requested_scope: ['offline', 'openid'], request_url: 'http://localhost' })
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

    test('Handles consent request for mandate', async () => {
      const mandate = await Mandate.query().insert({
        assetCode: 'USD',
        assetScale: 2,
        amount: 500n
      })
      const authorizationDetails = [
        {
          type: 'open_payments_mandate',
          locations: [
            mandate.toJSON().name
          ],
          actions: [
            'read', 'charge'
          ]
        }
      ]

      hydra.getConsentRequest = jest.fn().mockResolvedValue({ skip: false, subject: user.id.toString(), client: 'test-client', requested_scope: ['offline'], request_url: `https://localhost.com/authorize?authorization_details=${encodeURIComponent(JSON.stringify(authorizationDetails))}` })

      const { status, data } = await axios.get(`http://localhost:${appContainer.port}/consent?consent_challenge=test`)

      expect(status).toEqual(200)
      expect(hydra.getConsentRequest).toHaveBeenCalled()
      expect(data).toMatchObject({
        requestedScopes: ['offline'],
        client: 'test-client',
        user: user.id.toString()
      })
      expect(data.mandate).toMatchObject({
        id: mandate.id
      })
    })
  })

  describe('Post consent', function () {
    test('gives consent if user accepts and returns redirectTo', async () => {
      hydra.getConsentRequest = jest.fn().mockResolvedValue({ requested_access_token_audience: 'test', subject: user.id.toString(), scopes: ['offline', 'openid'], request_url: 'http://localhost' })
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


    test('binds accountId, userId to mandate if user gives consent for mandate', async () => {
      const mandate = await Mandate.query().insert({
        assetCode: 'USD',
        assetScale: 2,
        amount: 500n
      })
      const authorizationDetails = [
        {
          type: 'open_payments_mandate',
          locations: [
            mandate.toJSON().name
          ],
          actions: [
            'read', 'charge'
          ]
        }
      ]

      hydra.getConsentRequest = jest.fn().mockResolvedValue({ skip: false, subject: user.id.toString(), client: 'test-client', requested_scope: ['offline'], requested_access_token_audience: 'test', request_url: `https://localhost.com/authorize?authorization_details=${encodeURIComponent(JSON.stringify(authorizationDetails))}` })
      hydra.acceptConsentRequest = jest.fn().mockResolvedValue({ redirect_to: 'http://localhost:9010/callback' })

      const { status, data } = await axios.post(`http://localhost:${appContainer.port}/consent?consent_challenge=testChallenge`, { accepts: true, accountId: account.id, scopes: ['offline', 'openid'] })

      const updatedMandate = await mandate.$query()
      expect(updatedMandate.accountId).toBe(account.id)
      expect(status).toEqual(200)
      expect(data).toEqual({ redirectTo: 'http://localhost:9010/callback' })
      expect(hydra.getConsentRequest).toHaveBeenCalled()
      expect(hydra.acceptConsentRequest).toHaveBeenCalledWith('testChallenge', {
        remember: true,
        remember_for: 0,
        grant_scope: ['offline', 'openid'],
        grant_access_token_audience: 'test',
        session: {
          access_token: {
            authorization_details: authorizationDetails
          },
          id_token: {
            authorization_details: authorizationDetails
          }
        }
      })
    })
  })
})
