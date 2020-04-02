import axios from 'axios'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Account } from '../../src/models'

describe('Open Payments Metadata', function () {
  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
    await appContainer.knex.migrate.latest()
  })

  afterAll(async () => {
    await appContainer.knex.migrate.rollback()
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  describe('Get', function () {

    test('returns the open payments metadata', async () => {
      const { status } = await axios.get(`http://localhost:${appContainer.port}/.well-known/open-payments`)

      expect(status).toEqual(200)
    })
  })
})
