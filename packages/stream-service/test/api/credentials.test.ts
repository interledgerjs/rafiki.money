import axios from 'axios'
import { createTestApp, TestAppContainer } from '../helpers/app'

describe('Credentials API Test', () => {
  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  afterAll(() => {
    appContainer.app.shutdown()
  })

  test('Can get STREAM credentials without data', async () => {
    const response = await axios.post(`http://localhost:${appContainer.port}/credentials`, {})
      .then(resp => {
        return resp.data
      })

    expect(response.ilpAddress).toBeDefined()
    expect(response.ilpAddress).toContain('test.stream')
    expect(response.sharedSecret).toBeDefined()
  })

  test('Can get STREAM credentials with data encoded', async () => {
    const response = await axios.post(`http://localhost:${appContainer.port}/credentials`, {
      data: {
        userId: 1,
        invoiceId: 1
      }
    }).then(resp => {
      return resp.data
    })

    expect(response.ilpAddress).toBeDefined()
    expect(response.ilpAddress).toContain('test.stream')
    expect(response.sharedSecret).toBeDefined()
  })
})
