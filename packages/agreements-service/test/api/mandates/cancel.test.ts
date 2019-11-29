import axios from 'axios'
import { App, Agreement } from '../../../src'
import { AgreementBucket } from '../../../src/services/agreementBucket'
import Knex from 'knex'
import { refreshDatabase } from '../../db'

const MockRedis = require('ioredis-mock')

const mockRedis = new MockRedis()
const agreementBucket = new AgreementBucket(mockRedis)

describe('Cancel mandate', () => {
  let db: Knex
  let app: App
  let mandate: Agreement

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
    mandate = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      type: 'mandate'
    })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete()
    await db.destroy()
  })

  test('cancel a valid mandate should return 200', async () => {
    let timestamp = new Date().getTime()

    const { status, data } = await axios.patch(
      'http://localhost:4000/mandates/' + mandate.id,
      {
        cancelled: timestamp
      }
    )

    expect(status).toEqual(200)
    expect(data.cancelled).toEqual(timestamp)
    const editedMandate = await mandate.$query()
    expect(editedMandate.isMandate()).toBe(true)
    expect(editedMandate.accountId).toBeNull()
    expect(editedMandate.amount).toEqual(mandate.amount)
    expect(editedMandate.assetCode).toEqual(mandate.assetCode)
    expect(editedMandate.assetScale).toEqual(mandate.assetScale)
  })

  test('cancel a non-existant mandate should return 404', async () => {
    let timestamp = new Date().getTime()

    try {
      await axios.patch('http://localhost:4000/mandates/123', {
        cancelled: timestamp
      })
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(404)
      return
    }

    expect(false).toBe(true)
  })

  test('cancel a mandate that has already been cancelled should rerturn 400', async () => {
    let timestamp = new Date().getTime()
    let cancelledmandate = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      type: 'mandate',
      cancelled: timestamp
    })

    try {
      await axios.patch(
        'http://localhost:4000/mandates/' + cancelledmandate.id,
        {
          cancelled: timestamp
        }
      )
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(400)
      return
    }

    expect(false).toBe(true)
  })
})

describe('retrieve agreements by state', () => {
  let db: Knex
  let app: App
  let normalMandate: Agreement
  let expiredMandate: Agreement
	let cancelledMandate: Agreement
	let timestamp = new Date().getTime()
	let testUserId = 5

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucket)
    app.listen(4000)
		// functional
    normalMandate = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      userId: testUserId,
			type: 'mandate',
			expiry: timestamp + 1000000
    })
		// expired
    expiredMandate = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      userId: testUserId,
      type: 'mandate',
			expiry: timestamp - 1000
    })
		// cancelled
    cancelledMandate = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      userId: testUserId,
			type: 'mandate',
			cancelled: timestamp,
			expiry: timestamp + 1000000
    })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete()
    await db.destroy()
  })

	test('retirieving valid agreement should have matching ids and return 200', async () => {
    const { status, data } = await axios.get(
      `http://localhost:4000/mandates/?userId=${testUserId}&state=active`
    )

		console.log(`http://localhost:4000/mandates/?userId=${testUserId}&state=active`,data, normalMandate)

		expect(status).toEqual(200)
		expect(data.length).toEqual(1)
    expect(data[0].id).toEqual(normalMandate.id)
  })

	test('retirieving expired agreement should have matching ids and return 200', async () => {
    const { status, data } = await axios.get(
      `http://localhost:4000/mandates/?userId=${testUserId}&state=expired`
    )

		console.log(data)

		expect(status).toEqual(200)
		expect(data.length).toEqual(1)
    expect(data[0].id).toEqual(expiredMandate.id)
	})

	test('retirieving cancelled agreement should have matching ids and return 200', async () => {
    const { status, data } = await axios.get(
      `http://localhost:4000/mandates/?userId=${testUserId}&state=cancelled`
    )

		console.log(data)
		expect(status).toEqual(200)
		expect(data.length).toEqual(1)
    expect(data[0].id).toEqual(cancelledMandate.id)
	})

})
