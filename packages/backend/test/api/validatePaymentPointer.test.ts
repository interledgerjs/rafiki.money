import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'
import nock from 'nock'
import Koa from 'koa'

describe('Validate Payment Pointer', function () {
  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
    await appContainer.knex.migrate.latest()

    const app = new Koa()
    app.use(async (ctx) => {
      console.log()
    })
    nock('https://paymentpointer.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/.well-known/open-payments')
      .reply(200, {
        issuer: 'https://paymentpointer.com'
      })
    nock('https://spsp.com')
      .defaultReplyHeaders({
        'Content-Type': 'application/spsp4+json'
      })
      .get('/alice/.well-known/pay')
      .reply(200, {
        destination_account: 'example.ilpdemo.red.alice',
        shared_secret: '6jR5iNIVRvqeasJeCty6C+YB5X9FhSOUPCL/5nha5Vs='
      })
  })

  afterAll(async () => {
    await appContainer.knex.migrate.rollback()
    appContainer.app.shutdown()
    await appContainer.knex.destroy()
  })

  test('Validates for Open Payments', async () => {
    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/paymentpointers/validate?pp=${'$paymentpointer.com'}`)

    expect(status).toEqual(200)
    expect(data).toEqual({
      type: 'open-payments'
    })
  })

  test('Validates for SPSP', async () => {
    const { data, status } = await axios.get(`http://localhost:${appContainer.port}/paymentpointers/validate?pp=$spsp.com/alice`)

    expect(status).toEqual(200)
    expect(data).toEqual({
      type: 'spsp'
    })
  })

  test('Throw Error if not a valid Payment Pointer', async () => {
    const { status } = await axios.get(`http://localhost:${appContainer.port}/paymentpointers/validate?pp=`)
      .catch(error => {
        return error.response
      })

    expect(status).toEqual(404)
  })
})
