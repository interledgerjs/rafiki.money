import axios from 'axios'
import { createHmac } from 'crypto'
import { App, Agreement } from '../../../src'
import { AgreementBucket } from '../../../src/services/agreementBucket'
import Knex = require("knex")
import {refreshDatabase} from "../../db"
const MockRedis = require('ioredis-mock')


const mockRedis = new MockRedis()
const agreementBucket = new AgreementBucket(mockRedis)

describe('Getting an Intent', () => {

  let app: App
  let managedIntent: Agreement
  let unmanagedIntent: Agreement
  let db: Knex

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
    await Agreement.query().insert({ assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', scope: '$wallet.example.com/alice', userId: 1, type: 'intent' })
    await Agreement.query().insert({ assetCode: 'USD', assetScale: 2, amount: '500', scope: '$wallet.example.com/alice', userId: 1, type: 'mandate' })
    managedIntent = await Agreement.query().insertAndFetch({ assetCode: 'USD', assetScale: 2, callback: 'http://localhost:3000/ilpcallback', scope: '$wallet.example.com/alice', userId: 2, type: 'intent' })
    unmanagedIntent = await Agreement.query().insertAndFetch({ assetCode: 'USD', assetScale: 2, secret: 'secret', secretSalt: 'salt', scope: '$wallet.example.com/alice', userId: 2, type: 'intent' })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete() // clean up db after test
    await db.destroy()
  })

  test('can retrieve intents for a user\'s wallet account', async () => {
    const { data } = await axios.get('http://localhost:4000/intents?userId=2')

    expect(data.length).toBe(2)
    expect([data[0].id, data[1].id]).toEqual([managedIntent.id, unmanagedIntent.id])
    const returnedManagedIntent = data[0].id === managedIntent.id ? data[0] : data[1]
    const returnedUnmanagedIntent = data[1].id === unmanagedIntent.id ? data[1] : data[0]
    expect(returnedManagedIntent.destination).toEqual(`test.wallet.intents.${managedIntent.id}`)
    expect(returnedManagedIntent.balance).toEqual(0)

    expect(returnedUnmanagedIntent.destination).toEqual(`test.wallet.intents.${unmanagedIntent.id}`)
    expect(returnedUnmanagedIntent.balance).toEqual(0)
    expect(returnedUnmanagedIntent.secret).not.toBeDefined()
    expect(returnedUnmanagedIntent.secretSalt).toEqual('salt')
    expect(returnedUnmanagedIntent.secretHash).toEqual(createHmac('SHA256', 'salt').update('secret').digest('base64'))
  })
})
