import Knex from 'knex'
import axios from 'axios'
import bcrypt from 'bcrypt'
import { hydra } from '../../src/services/hydra'
import { User } from '../../src/models/user'
import { createTestApp, TestAppContainer } from '../helpers/app'

describe('Login', function () {
  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.app.shutdown()
    appContainer.knex.destroy()
  })

  describe('Get login request', function () {
    test('does not accept hydra login if user is not currently logged in', async () => {
      hydra.getLoginRequest = jest.fn().mockResolvedValue({ skip: false })
      hydra.acceptLoginRequest = jest.fn()

      const { status } = await axios.get(`http://localhost:${appContainer.port}/login?login_challenge=test`)

      expect(status).toEqual(200)
      expect(hydra.getLoginRequest).toBeCalledWith('test')
      expect(hydra.acceptLoginRequest).not.toBeCalled()
    })

    test('accepts hydra login and returns a redirect url if user is logged in already', async () => {
      hydra.getLoginRequest = jest.fn().mockResolvedValue({
        skip: true,
        subject: '2'
      })
      hydra.acceptLoginRequest = jest.fn().mockResolvedValue({
        redirect_to: 'http://localhost:3000/redirect'
      })

      const { status, data } = await axios.get(`http://localhost:${appContainer.port}/login?login_challenge=test`)

      expect(hydra.acceptLoginRequest).toHaveBeenCalledWith('test', { subject: '2', remember: false })
      expect(data.redirectTo).toEqual(`http://localhost:3000/redirect`)
      expect(status).toEqual(200)
    })

    test('login_challenge query parameter is required', async () => {
      try {
        await axios.get(`http://localhost:${appContainer.port}/login`)
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('login_challenge is required.')
        return
      }
      fail()
    })
  })

  describe('Post login', function () {
    test('returns 401 if username does not exist', async () => {
      try {
        await axios.post(`http://localhost:${appContainer.port}/login?login_challenge=testChallenge`, { username: 'alice', password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }
      fail()
    })

    test('returns 401 if password is incorrect', async () => {
      await User.query().insert({ username: 'alice', password: await bcrypt.hash('test', await bcrypt.genSalt()) })

      try {
        await axios.post(`http://localhost:${appContainer.port}/login?login_challenge=testChallenge`, { username: 'alice', password: 'asd' })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })

    test('login_challenge query parameter is required', async () => {
      try {
        await axios.post(`http://localhost:${appContainer.port}/login`, { username: 'alice', password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('login_challenge is required.')
        return
      }
      fail()
    })

    describe('valid user credentials', function () {
      test('accepts hydra login', async () => {
        hydra.acceptLoginRequest = jest.fn().mockResolvedValue({
          redirect_to: 'http://localhost:3000/redirect'
        })
        const user = await User.query().insert({ username: 'alice', password: await bcrypt.hash('test', await bcrypt.genSalt()) })

        await axios.post(`http://localhost:${appContainer.port}/login?login_challenge=testChallenge`, { username: 'alice', password: 'test' })

        expect(hydra.acceptLoginRequest).toHaveBeenCalledWith('testChallenge', { subject: user.id.toString(), remember: false })
      })
    })
  })
})
