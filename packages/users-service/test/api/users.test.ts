import axios from 'axios'
import bcrypt from 'bcrypt'
import createLogger from 'pino'
import { User } from '../../src/models/user'
import { refreshDatabase } from '../helpers/db'
import { App } from '../../src/app'
import { hydra } from '../../src/services/hydra'
import { TokenService } from '../../src/services/token-service'
import Knex = require('knex')
import { SignupSession } from '../../src/models/signupSession'

describe('Users Service', function () {
  let knex: Knex
  const logger = createLogger()
  const app = new App(logger, {} as TokenService)

  beforeEach(async () => {
    knex = await refreshDatabase()
    await app.listen(3000)
  })

  afterEach(async () => {
    await app.shutdown()
    await knex.destroy()
  })

  describe('create', function () {
    test('creates a user', async () => {
      const { data } = await axios.post<User>('http://localhost:3000/users', { username: 'alice', password: 'test' })

      const retrievedUser = await User.query().where('userName', 'alice').first()
      expect(retrievedUser).toBeInstanceOf(User)
      expect(retrievedUser!.username).toEqual('alice')

      expect(data.username).toEqual('alice')
    })

    test('creating a user adds a signup session', async () => {
      const { data } = await axios.post('http://localhost:3000/users', { username: 'alice', password: 'test' })

      const session = await SignupSession.query().where('id', data.signupSessionId).first()

      expect(session!.userId).toBe(data.id.toString())
    })

    test('does not return password', async () => {
      const { data } = await axios.post<User>('http://localhost:3000/users', { username: 'alice', password: 'test' })

      expect(data.password).toBeUndefined()
    })

    test('hashes the password', async () => {
      const { data } = await axios.post<User>('http://localhost:3000/users', { username: 'alice', password: 'test' })

      expect(data.password).not.toEqual('test')
    })

    test('userName is required', async () => {
      try {
        await axios.post<User>('http://localhost:3000/users', { password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('child "username" fails because ["username" is required]')
        return
      }

      fail()
    })

    test('password is required', async () => {
      try {
        await axios.post<User>('http://localhost:3000/users', { username: 'bob' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('child "password" fails because ["password" is required]')
        return
      }

      fail()
    })

    test('userName must be unique', async () => {
      await User.query().insert({ username: 'alice' })

      try {
        await axios.post<User>('http://localhost:3000/users', { username: 'alice', password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('Username is already taken.')
        return
      }

      fail()
    })
  })

  describe('Edit', function () {
    test('hashes the new password', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:3000/users/${user.id}`, { password: 'newPassword' })

      const updatedUser = await user.$query()
      expect(updatedUser.password).not.toEqual('oldPassword')
      expect(updatedUser.password).not.toEqual('newPassword')
      expect(bcrypt.compare('newPassword', updatedUser.password)).toBeTruthy()
    })

    test('can set the default account id', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:3000/users/${user.id}`, { defaultAccountId: '1' })

      const updatedUser = await user.$query()
      expect(updatedUser.defaultAccountId).toEqual('1')
      expect(bcrypt.compare('oldPassword', updatedUser.password)).toBeTruthy()
    })
  })

  describe('Show', function () {
    test('returns user if there token is valid', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice' })
      hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: user.id.toString(),
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      const { data } = await axios.get('http://localhost:3000/users/me', { headers: { authorization: 'Bearer validToken' } })

      expect(data).toEqual(user.$formatJson())
      expect(data.password).toBeUndefined()
    })

    test('returns 401 if there is no token', async () => {
      hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: '1',
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      try {
        await axios.get('http://localhost:3000/users/me')
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })

    test('returns 401 if token is invalid', async () => {
      hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: '1',
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      try {
        await axios.get('http://localhost:3000/users/me', { headers: { authorization: 'Bearer invalidToken' } })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })
  })
})
