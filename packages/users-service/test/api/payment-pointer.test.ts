import axios from 'axios'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'

describe('Payment pointer', function () {
  let appContainer: TestAppContainer

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

  describe('Get', function () {
    test('returns the oauth server meta data and users default account id', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice' })

      const { data, status } = await axios.get(`http://localhost:${appContainer.port}/p/${user.username}`)

      expect(status).toEqual(200)
      expect(data).toEqual({
        payment_intents_endpoint: 'http://localhost:3001/intents',
        payment_mandates_endpoint: 'http://localhost:3001/mandates',
        payment_assets_supported: ['USD'],
        authorization_endpoint: 'http://localhost:9000/oauth2/auth',
        token_endpoint: 'http://localhost:9000/oauth2/token',
        issuer_endpoint: 'http://localhost:9000/'
      })
    })

    test('returns 404 for invalid username', async () => {
      try {
        await axios.get(`http://localhost:${appContainer.port}/p/drew`)
      } catch (error) {
        expect(error.response.status).toEqual(404)
        return
      }

      fail()
    })
  })
})
