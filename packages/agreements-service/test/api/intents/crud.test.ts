import axios from 'axios'
import { randomBytes } from 'crypto'
import { createHmac } from 'crypto'
import { App, Agreement } from '../../../src'
import {AgreementBucketMock} from "../../mocks/agreementBucketMock"
import {refreshDatabase} from "../../db"
import Knex = require("knex")

const agreementBucketMock = new AgreementBucketMock()

describe('Intent creation', () => {

  let app: App
  let db: Knex

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucketMock)
    app.listen(4000)
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete() // clean up db after test
    await db.destroy()
  })

  test(
    'uses a 32 byte salt to create a hash of the given secret for an un-managed intent',
    async () => {
      const secret = randomBytes(32).toString('base64')
      expect(await Agreement.query()).toEqual([])

      const { headers, status, data } = await axios.post('http://localhost:4000/intents', {
        scope: "$wallet.example/alice",
        secret,
        asset: {
          scale: 2,
          code: 'USD',
        }
      })

      expect(status).toEqual(201)
      expect(headers['location']).toEqual(`http://localhost:4000/intents/${data.id}`)
      expect(typeof data.secretSalt).toBe('string')
      expect(Buffer.from(data.secretSalt, 'base64').length).toBe(32)
      const hmacSecret = createHmac('SHA256', data.secretSalt).update(secret).digest().toString('base64')
      expect(data.secretHash).toEqual(hmacSecret)
      expect(data.asset).toEqual({ scale: 2, code: 'USD' })
      expect(data.scope).toEqual("$wallet.example/alice")
      expect(data.amount).not.toBeDefined()
      expect(data.callback).not.toBeDefined()
      expect((await Agreement.query().first())!.isMandate()).toBe(false)
    }
  )

  test(
    'does not hash a secret when a callback is specified for a managed intent',
    async () => {
      expect(await Agreement.query()).toEqual([])

      const { headers, status, data } = await axios.post('http://localhost:4000/intents', {
        scope: "$wallet.example/alice",
        callback: 'http://localhost:3001/ilpcallback',
        asset: {
          scale: 2,
          code: 'USD',
        }
      })

      expect(status).toEqual(201)
      expect(headers['location']).toEqual(`http://localhost:4000/intents/${data.id}`)
      expect(data.callback).toEqual('http://localhost:3001/ilpcallback')
      expect(data.asset).toEqual({ scale: 2, code: 'USD' })
      expect(data.scope).toEqual("$wallet.example/alice")
      expect(data.amount).not.toBeDefined()
      expect(data.secretHash).not.toBeDefined()
      expect(data.secretSalt).not.toBeDefined()
      expect((await Agreement.query().first())!.isMandate()).toBe(false)
    }
  )

  test(
    'returns the destination as <configured address>.intents.<intent id>',
    async () => {
      expect(await Agreement.query()).toEqual([])

      const { data } = await axios.post('http://localhost:4000/intents', {
        scope: "$wallet.example/alice",
        callback: 'http://localhost:3001/ilpcallback',
        asset: {
          scale: 2,
          code: 'USD',
        }
      })

      expect(data.destination).toEqual(`test.wallet.intents.${data.id}`)
    }
  )

  test('returns 400 when callback and secret are specified', async () => {
    expect(await Agreement.query()).toEqual([])
    const secret = randomBytes(32).toString('base64')

    try {
      await axios.post('http://localhost:4000/intents', {
        scope: "$wallet.example/alice",
        secret,
        callback: 'http://localhost:3001/ilpcallback',
        asset: {
          scale: 2,
          code: 'USD',
        }
      })
    } catch (error) {
      expect(error.response.status).toEqual(400)
      expect(error.response.data).toEqual('Specify either callback or secret.')
      return
    }

    expect(false).toBe(true)
  })

  test('returns 400 when neither callback or secret are specified', async () => {
    expect(await Agreement.query()).toEqual([])

    try {
      await axios.post('http://localhost:4000/intents', {
        scope: "$wallet.example/alice",
        asset: {
          scale: 2,
          code: 'USD',
        }
      })
    } catch (error) {
      expect(error.response.status).toEqual(400)
      expect(error.response.data).toEqual('Specify either callback or secret.')
      return
    }

    expect(false).toBe(true)
  })
})
