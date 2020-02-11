import axios from 'axios'
import bcrypt from 'bcrypt'
import { User } from '../../src/models/user'
import { hydra } from '../../src/services/hydra'
import { SignupSession } from '../../src/models/signupSession'
import { createTestApp, TestAppContainer } from '../helpers/app'
import { mockAuth } from '../helpers/auth'

describe('Users Service', function () {
  let appContainer: TestAppContainer
  mockAuth()

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

  describe('create', function () {
    test('creates a user', async () => {
      const { data } = await axios.post<User>(`http://localhost:${appContainer.port}/users`, { username: 'alice', password: 'test' })

      const retrievedUser = await User.query().where('username', 'alice').first()
      expect(retrievedUser).toBeInstanceOf(User)
      expect(retrievedUser!.username).toEqual('alice')

      expect(data.username).toEqual('alice')
    })

    test('creating a user adds a signup session', async () => {
      const { data } = await axios.post(`http://localhost:${appContainer.port}/users`, { username: 'alice', password: 'test' })

      const session = await SignupSession.query().where('id', data.signupSessionId).first()

      expect(session!.userId).toBe(data.id.toString())
    })

    test('does not return password', async () => {
      const { data } = await axios.post<User>(`http://localhost:${appContainer.port}/users`, { username: 'alice', password: 'test' })

      expect(data.password).toBeUndefined()
    })

    test('hashes the password', async () => {
      const { data } = await axios.post<User>(`http://localhost:${appContainer.port}/users`, { username: 'alice', password: 'test' })

      expect(data.password).not.toEqual('test')
    })

    test('username is required', async () => {
      try {
        await axios.post<User>(`http://localhost:${appContainer.port}/users`, { password: 'test' })
      } catch (error) {
        const { data } = error.response
        expect(error.response.status).toEqual(422)
        expect(data.errors[0].field).toBe('username')
        expect(data.errors[0].message).toBe('\"username\" is required')
        return error
      }

      fail()
    })

    test('password is required', async () => {
      try {
        await axios.post<User>(`http://localhost:${appContainer.port}/users`, { username: 'bob' })
      } catch (error) {
        const { data } = error.response
        expect(error.response.status).toEqual(422)
        expect(data.errors[0].field).toBe('password')
        expect(data.errors[0].message).toBe('\"password\" is required')
        return error
      }

      fail()
    })

    test('username must be unique', async () => {
      await User.query().insert({ username: 'alice' })

      try {
        await axios.post<User>(`http://localhost:${appContainer.port}/users`, { username: 'alice', password: 'test' })
      } catch (error) {
        const { data } = error.response
        expect(error.response.status).toEqual(422)
        expect(data.errors[0].field).toBe('username')
        expect(data.errors[0].message).toBe('Username exists already')
        return
      }

      fail()
    })
  })

  describe('Edit', function () {
    test('hashes the new password', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:${appContainer.port}/users/${user.id}`, { password: 'newPassword' },
        { headers: { authorization: `Bearer user_${user.id}` } })

      const updatedUser = await user.$query()
      expect(updatedUser.password).not.toEqual('oldPassword')
      expect(updatedUser.password).not.toEqual('newPassword')
      expect(bcrypt.compare('newPassword', updatedUser.password)).toBeTruthy()
    })

    test('can set the default account id', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:${appContainer.port}/users/${user.id}`, { defaultAccountId: '1' },
        { headers: { authorization: `Bearer user_${user.id}` } })

      const updatedUser = await user.$query()
      expect(updatedUser.defaultAccountId).toEqual('1')
      expect(bcrypt.compare('oldPassword', updatedUser.password)).toBeTruthy()
    })
  })

  describe('Show', function () {
    test('returns user if there token is valid', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice' })

      const { data } = await axios.get(`http://localhost:${appContainer.port}/users/me`, { headers: { authorization: `Bearer user_${user.id}` } })

      expect(data).toEqual(user.$formatJson())
      expect(data.password).toBeUndefined()
    })

    test('returns 401 if there is no token', async () => {
      try {
        await axios.get(`http://localhost:${appContainer.port}/users/me`)
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })

    test('returns 401 if token is invalid', async () => {
      try {
        await axios.get(`http://localhost:${appContainer.port}/users/me`, { headers: { authorization: 'Bearer invalidToken' } })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })
  })
})
