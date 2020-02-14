import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { Mandate } from '../../src/models/mandate'
import { User } from '../../src/models/user'

describe('Create mandate', () => {
  let appContainer: TestAppContainer
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
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

  test('can create mandate without user and account', async () => {
    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/mandates`, {
      description: 'Test transaction',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500'
    })

    expect(status).toEqual(201)
    expect(data.amount).toEqual('500')

    const mandate = await Mandate.query().findById(data.id)
    expect(mandate).toBeDefined()
    expect(mandate!.amount).toEqual(500n)
    expect(mandate!.description).toEqual('Test transaction')
    expect(mandate!.assetCode).toEqual('USD')
    expect(mandate!.assetScale).toEqual(2)
  })

  test('sets the start of the mandate to the given start time', async () => {
    const date: Date = new Date()
    date.setDate(date.getDate() + 1)

    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/mandates`, {
      description: 'Test transaction',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500',
      startAt: date.toISOString()
    })

    expect(status).toEqual(201)
    expect(data.startAt).toEqual(date.toISOString())
  })

  test('defaults expiry null', async () => {
    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/mandates`, {
      description: 'Test transaction',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500'
    })

    expect(status).toEqual(201)
    expect(data.expireAt).toBeNull()
  })

  test('sets the expiry to the given expiry', async () => {
    const date: Date = new Date()
    date.setDate(date.getDate() + 1)

    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/mandates`, {
      description: 'Test transaction',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500',
      expireAt: date.toISOString()
    })

    expect(status).toEqual(201)
    expect(data.expireAt).toEqual(date.toISOString())
  })

  test('sets the scope to the given scope', async () => {
    const { status, data } = await axios.post(`http://localhost:${appContainer.port}/mandates`, {
      description: 'Test transaction',
      assetScale: 2,
      assetCode: 'USD',
      amount: '500',
      scope: '$rafiki.money/p/alice'
    })

    expect(status).toEqual(201)
    expect(data.scope).toEqual('$rafiki.money/p/alice')
  })
})

describe('Get mandate', () => {
  let appContainer: TestAppContainer
  let mandate: Mandate
  let user: User
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
    user = await User.query().insertAndFetch({
      username: 'alice'
    })
    mandate = await Mandate.query().insertAndFetch({
      // @ts-ignore
      description: "mandate",
      userId: user.id,
      assetCode: 'USD',
      assetScale: 2,
      amount: 500n,
      balance: 0n,
      startAt: new Date(Date.now()),
      expireAt: null
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  test('User can get their mandate', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates/${mandate.id}`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.id).toEqual(mandate.id)
  })

  test('User cant get another users mandate', async () => {
    const otherUser = await User.query().insertAndFetch({
      username: 'bob'
    })
    expect(mandate.cancelledAt).toBeNull()

    try {
      await axios.get(`http://localhost:${appContainer.port}/mandates/${mandate.id}`,{
        headers: {
          authorization: `Bearer user_${otherUser.id}`
        }
      })
    } catch (error) {
      const resp = error.response
      expect(resp.status).toEqual(404)
      return
    }

    fail()
  })

  test('User can a list of their mandates', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.length).toEqual(1)
  })

  test('User can a list of their mandates', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.length).toEqual(1)
  })

  test('User can filter list for active mandates', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates?state=active`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.length).toEqual(1)
  })

  test('User can filter list for expired mandates', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates?state=expired`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.length).toEqual(0)
  })

  test('User can filter list for cancelled mandates', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer.port}/mandates?state=cancelled`,{
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(200)
    expect(data.length).toEqual(0)
  })
})

describe('Cancel mandate', () => {
  let appContainer: TestAppContainer
  let mandate: Mandate
  let user: User
  mockAuth()

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
    user = await User.query().insertAndFetch({
      username: 'alice'
    })
    mandate = await Mandate.query().insertAndFetch({
      // @ts-ignore
      description: "mandate",
      userId: user.id,
      assetCode: 'USD',
      assetScale: 2,
      amount: 500n,
      balance: 0n,
      startAt: new Date(Date.now()),
      expireAt: null
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  test('User can cancel their mandate', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.put(`http://localhost:${appContainer.port}/mandates/${mandate.id}/cancel`, {}, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    expect(status).toEqual(201)

    const refreshedMandate = await Mandate.query().findById(mandate.id)
    expect(refreshedMandate.cancelledAt).toBeDefined()
  })

  test('User cant cancel another users mandate', async () => {
    const otherUser = await User.query().insertAndFetch({
      username: 'bob'
    })
    expect(mandate.cancelledAt).toBeNull()

    try {
      await axios.put(`http://localhost:${appContainer.port}/mandates/${mandate.id}/cancel`, {}, {
        headers: {
          authorization: `Bearer user_${otherUser.id}`
        }
      })
    } catch (error) {
      const resp = error.response
      expect(resp.status).toEqual(404)
      return
    }

    fail()
  })
})
