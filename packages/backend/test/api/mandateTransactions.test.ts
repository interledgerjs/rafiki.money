import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'
import { Mandate } from '../../src/models/mandate'
import { User } from '../../src/models/user'
import { MandateTransaction } from '../../src/models/mandateTransaction'

describe('Get mandate', () => {
  let appContainer: TestAppContainer
  let user: User
  let mandate: Mandate
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
      description: 'mandate',
      userId: user.id,
      assetCode: 'USD',
      assetScale: 2,
      amount: 500n,
      balance: 0n,
      startAt: new Date(Date.now()),
      expireAt: null
    })
    const interval = await mandate.currentInterval()
    await MandateTransaction.query().insertAndFetch({
      // @ts-ignore
      accountId: 1,
      amount: 200n,
      description: 'mandateTransaction',
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
      mandateId: mandate.id,
      mandateIntervalId: interval.id
    })
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  test('User can a list of their mandate transactions', async () => {
    expect(mandate.cancelledAt).toBeNull()

    const { status, data } = await axios.get(`http://localhost:${appContainer
      .port}/mandates/${mandate.id}/transactions`, {
      headers: {
        authorization: `Bearer user_${user.id}`
      }
    })

    // console.log(data)
    expect(status).toEqual(200)
    expect(data.length).toEqual(1)
  })

  test('User cant get another users mandate transactions', async () => {
    const otherUser = await User.query().insertAndFetch({
      username: 'bob'
    })
    expect(mandate.cancelledAt).toBeNull()

    try {
      await axios.get(`http://localhost:${appContainer.port}/mandates/${mandate
        .id}/transactions`, {
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
