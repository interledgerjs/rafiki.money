import axios from 'axios'
import { App, Agreement } from '../../src'
import { AgreementBucketMock } from '../mocks/agreementBucketMock'
import { refreshDatabase } from '../db'
import Knex = require('knex')

const agreementBucketMock = new AgreementBucketMock()

describe('Agreement Transaction', () => {
  let app: App
  let agreement: Agreement
  let db: Knex
  let cancelledAgreement: Agreement
  let timestamp = new Date().getTime()

  beforeEach(async () => {
    db = await refreshDatabase()
    app = new App(agreementBucketMock)
    app.listen(4000)
    agreement = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      userId: 4,
      accountId: 3
    })
    cancelledAgreement = await Agreement.query().insertAndFetch({
      amount: '100',
      assetCode: 'USD',
      assetScale: 2,
      userId: 4,
      accountId: 3,
      cancelledAt: timestamp
    })
  })

  afterEach(async () => {
    app.shutdown()
    await Agreement.query().delete()
    await db.destroy()
  })

  test('Posting transaction with available amount returns 201', async () => {
    const { status } = await axios.post(
      `http://localhost:4000/agreements/${agreement.id}/transactions`,
      {
        amount: 50
      }
    )

    expect(status).toEqual(201)
  })

  test('Posting transaction with not available amount returns 403', async () => {
    try {
      const { status } = await axios.post(
        `http://localhost:4000/agreements/${agreement.id}/transactions`,
        {
          amount: 200
        }
      )
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(403)
      return
    }

    expect(false).toBe(true)
  })

  test('Posting a transaction that is cancelled returns 403', async () => {
    try {
      const { status } = await axios.post(
        `http://localhost:4000/agreements/${cancelledAgreement.id}/transactions`,
        {
          amount: 10
        }
      )
    } catch (error) {
      const { status } = error.response
      expect(status).toEqual(403)
      return
    }

    expect(false).toBe(true)
  })
})
