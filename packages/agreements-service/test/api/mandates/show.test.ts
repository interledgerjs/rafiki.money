import axios from 'axios'
import { App, Agreement } from '../../../src'
import { AgreementBucket } from '../../../src/services/agreementBucket'
import Knex from "knex"
import {refreshDatabase} from "../../db"
const MockRedis = require('ioredis-mock')

const mockRedis = new MockRedis()
const agreementBucket = new AgreementBucket(mockRedis)

describe('Show mandate', () => {
  let app: App
  let mandate: Agreement
  let db: Knex

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
    mandate = await Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, accountId: 3, type: 'mandate' })
    await Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete()
    await db.destroy()
  })

  test('can retrieve mandate by id', async () => {
    const { status, data } = await axios.get('http://localhost:4000/mandates/' + mandate.id)

    expect(status).toEqual(200)
    expect(data.id).toEqual(mandate.id)
    expect(data.amount).toEqual(mandate.amount)
    expect(data.asset).toEqual({ code: mandate.assetCode, scale: mandate.assetScale })
    expect(data.userId).toEqual(mandate.userId)
    expect(data.accountId).toEqual(mandate.accountId)
    expect(data.balance).toEqual(100)
  })

  test('returns 404 if mandate does not exist', async () => {
    try {
      await axios.get('http://localhost:4000/mandates/123')
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(404)
      return
    }

    expect(false).toBe(true)
  })

  test('returns 404 if id belongs to an intent', async () => {
    const intent = await Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', callback: 'http://localhost:3000/ilpcallback', assetCode: 'USD', assetScale: 2, type: 'intent' })

    try {
      await axios.get('http://localhost:4000/mandates/' + intent.id)
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(404)
      return
    }

    expect(false).toBe(true)
  })
})
