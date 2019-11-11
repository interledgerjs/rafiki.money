import axios from 'axios'
import { createHmac } from 'crypto'
import { App, Agreement } from '../../../src'
import { AgreementBucket } from '../../../src/services/agreementBucket'
import Knex from "knex"
import {refreshDatabase} from "../../db"
const MockRedis = require('ioredis-mock')



const mockRedis = new MockRedis()
const agreementBucket = new AgreementBucket(mockRedis)

describe('Getting an Intent', () => {

  let app: App
  let db: Knex

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete() // clean up db after test
    await db.destroy()
  })

  test('does not leak secret for an un-managed intent', async () => {
    const intent = await Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', type: 'intent' })

    const { data } = await axios.get(`http://localhost:4000/intents/${intent.id}`)

    expect(data.secret).not.toBeDefined()
    expect(data.secretSalt).toEqual('salt')
    expect(data.secretHash).toEqual(createHmac('SHA256', 'salt').update('secret').digest('base64'))
  })

  test(
    'shows the balance as how much has been "taken" from the agreement bucket',
    async () => {
      const intent = await Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', start: Date.now(), type: 'intent' })

      const response = await axios.get(`http://localhost:4000/intents/${intent.id}`)
      expect(response.data.balance).toEqual(0)

      await agreementBucket.take(intent, 10)

      const response2 = await axios.get(`http://localhost:4000/intents/${intent.id}`)
      expect(response2.data.balance).toEqual(10)
    }
  )

  test(
    'sets the destination to <configured address>.intents.<intent id>',
    async () => {
      const intent = await Agreement.query().insertAndFetch({ scope: '$wallet.example.alice', assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', type: 'intent' })

      const { data } = await axios.get(`http://localhost:4000/intents/${intent.id}`)

      expect(data.secret).not.toBeDefined()
      expect(data.destination).toEqual(`test.wallet.intents.${intent.id}`)
    }
  )

  test('returns 404 for a mandate id', async () => {
    const mandate = await Agreement.query().insertAndFetch({ scope: '$wallet.example/bob', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' })

    try {
      await axios.get(`http://localhost:4000/intents/${mandate.id}`)
    } catch (error) {
      expect(error.response.status).toEqual(404)
      return
    }

    expect(false).toBe(true)
  })
})
