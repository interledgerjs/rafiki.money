import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const UsersService = (authErrorCallback?: () => void) => {
  return {
    signup: async (username: string, password: string) => {
      const url = new URL('users', USERS_API_URL)
      return ky.post(url.toString(), {
        json: { username, password }
      }).then(resp => resp.json())
    },
    getLogin: async (challenge: string) => {
      const url = new URL('login', USERS_API_URL)
      url.searchParams.set('login_challenge', challenge)
      return ky.get(url.toString()).then(resp => resp.json())
    },
    login: async (username: string, password: string, challenge: string) => {
      const url = new URL('login', USERS_API_URL)
      url.searchParams.set('login_challenge', challenge)
      return ky.post(url.toString(), {
        json: { username, password }
      }).then(resp => resp.json())
    },
    getConsent: async (challenge: string) => {
      const url = new URL('consent', USERS_API_URL)
      url.searchParams.set('consent_challenge', challenge)
      return ky.get(url.toString()).then(resp => resp.json())
    },
    handleConsent: async (challenge: string, body: object) => {
      const url = new URL('consent', USERS_API_URL)
      url.searchParams.set('consent_challenge', challenge)
      return ky.post(url.toString(), {
        json: body
      }).then(resp => resp.json())
    },
    handleLogout: async (challenge: string) => {
      const url = new URL('logout', USERS_API_URL)
      url.searchParams.set('logout_challenge', challenge)
      return ky.post(url.toString()).then(resp => resp.json())
    },
    getUser: async (token: string) => {
      const url = new URL('users/me', USERS_API_URL)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    update: async (id: number, body: any, token: string) => {
      const url = new URL(`users/${id}`, USERS_API_URL)
      return ky.patch(url.toString(), {
        headers: { authorization: `Bearer ${token}` },
        json: body
      }).then(resp => resp.json())
    },
    registerOauth2Client: async (clientDetails: any, token: string) => {
      const url = new URL(`oauth2/clients`, USERS_API_URL)
      console.log('client data posting', clientDetails)
      return ky.post(url.toString(), {
        json: clientDetails,
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    getAccounts: async (token: string, userId: string) => {
      const url = new URL('accounts/', USERS_API_URL)
      url.searchParams.set('userId', userId)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    getAccount: async (token: string, id: number) => {
      const url = new URL(`accounts/${id}`, USERS_API_URL)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    getBalance: async (token: string) => {
      const url = new URL('users/me/balance', USERS_API_URL)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    getPaymentPointer: async (token: string) => {
      const url = new URL('users/me/paymentpointer', USERS_API_URL)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    }
  }
}

function handleError (statusCode: number, authErrorCallback?: () => void) {
  if ((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
