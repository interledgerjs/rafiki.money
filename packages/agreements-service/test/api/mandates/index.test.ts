import axios from 'axios'
import { App, Agreement } from '../../../src'
import { AgreementBucket } from "../../../src/services/agreementBucket"
import Knex from 'knex'
import {refreshDatabase} from "../../db"
const MockRedis = require('ioredis-mock')


const mockRedis = new MockRedis()
const agreementBucket = new AgreementBucket(mockRedis)

describe('Index mandates', () => {
  let app: App
  let mandate: Agreement
  let db: Knex

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
    mandate = await Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, type: 'mandate' })
    await Agreement.query().insertAndFetch({ scope: '$wallet.example/alice', callback: 'http://localhost:3000/ilpcallback', amount: '100', assetCode: 'USD', assetScale: 2, userId: 4, type: 'intent' })
    await Agreement.query().insertAndFetch({ scope: '$wallet.example/bob', amount: '100', assetCode: 'USD', assetScale: 2, userId: 5, type: 'mandate' })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete()
    await db.destroy()
  })

  test('can retrieve mandates for users wallet account', async () => {
    const { data } = await axios.get('http://localhost:4000/mandates?userId=4')

    expect(data.length).toEqual(1)
    expect(data[0].id).toEqual(mandate.id)
    expect(data[0].amount).toEqual(mandate.amount)
    expect(data[0].balance).toEqual(100)
    expect(data[0].asset.code).toEqual(mandate.assetCode)
    expect(data[0].asset.scale).toEqual(mandate.assetScale)
    expect(data[0].userId).toEqual(mandate.userId)
  })
})
