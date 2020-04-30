import Knex, { Transaction } from 'knex'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { Mandate } from '../../src/models'
import { mockAuth } from '../helpers/auth'

import { Model } from 'objection'

describe('Mandate Test', () => {
  let appContainer: TestAppContainer
  let trx: Transaction
  mockAuth()

  beforeAll(async () => {
    appContainer = await createTestApp()
    await appContainer.knex.migrate.latest()
  })

  beforeEach(async () => {
    trx = await appContainer.knex.transaction()
    Model.knex(trx as Knex)
  })

  afterEach(async () => {
    await trx.rollback()
    await trx.destroy()
  })

  afterAll(async () => {
    await appContainer.knex.migrate.rollback()
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  describe('Current Interval', () => {
    test('if no interval the current start at interval is the startA', async () => {
      const mandate = await Mandate.query().insert({
        // @ts-ignore
        description: 'mandate',
        assetCode: 'USD',
        assetScale: 2,
        amount: 500n,
        balance: 0n,
        startAt: new Date(Date.now()),
        expireAt: null
      })
      const currentIntervalStartAt = mandate.currentIntervalStartAt()
      expect(currentIntervalStartAt.getTime()).toEqual(mandate.startAt.getTime())
    })

    test('if interval the current start at interval', async () => {
      const mandate = await Mandate.query().insert({
        // @ts-ignore
        description: 'mandate',
        assetCode: 'USD',
        assetScale: 2,
        amount: 500n,
        balance: 0n,
        startAt: new Date(Date.now()),
        expireAt: null
      })
      const currentInterval = await mandate.currentInterval()
      // expect(currentIntervalStartAt.getTime()).toEqual(mandate.startAt.getTime())
    })
  })
})
