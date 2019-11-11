import axios from 'axios'
import createLogger from 'pino'
import { User } from '../../src/models/user'
import { refreshDatabase } from '../helpers/db'
import { App } from '../../src/app'
import { TokenService } from '../../src/services/token-service'
import Knex = require('knex')

describe('Payment pointer', function () {
  let knex: Knex
  const logger = createLogger()
  const app = new App(logger, {} as TokenService)

  beforeEach(async () => {
    knex = await refreshDatabase()
    await app.listen(3000)
  })

  afterEach(async () => {
    await app.shutdown()
    await knex.destroy()
  })

  describe('Get', function () {
    test('returns the oauth server meta data and users default account id', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice' })

      const { data, status } = await axios.get(`http://localhost:3000/p/${user.username}`)

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
        await axios.get('http://localhost:3000/p/drew')
      } catch (error) {
        expect(error.response.status).toEqual(404)
        return
      }

      fail()
    })
  })
})
