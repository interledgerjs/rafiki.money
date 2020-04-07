import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const UsersService = (authErrorCallback?: () => void) => {
  return {
    signup: async (username: string, password: string) => {
      const url = new URL(`${USERS_API_URL}/users`)
      return ky.post(url.toString(), {
        json: { username, password }
      }).then(resp => resp.json())
    },
    getLogin: async (challenge: string) => {
      const url = new URL(`${USERS_API_URL}/login`)
      url.searchParams.set('login_challenge', challenge)
      return ky.get(url.toString()).then(resp => resp.json())
    },
    login: async (username: string, password: string, challenge: string) => {
      const url = new URL(`${USERS_API_URL}/login`)
      url.searchParams.set('login_challenge', challenge)
      return ky.post(url.toString(), {
        json: { username, password }
      }).then(resp => resp.json())
    },
    getConsent: async (challenge: string) => {
      const url = new URL(`${USERS_API_URL}/consent`)
      url.searchParams.set('consent_challenge', challenge)
      return ky.get(url.toString()).then(resp => resp.json())
    },
    handleConsent: async (challenge: string, body: object) => {
      const url = new URL(`${USERS_API_URL}/consent`)
      url.searchParams.set('consent_challenge', challenge)
      return ky.post(url.toString(), {
        json: body
      }).then(resp => resp.json())
    },
    handleLogout: async (challenge: string) => {
      const url = new URL(`${USERS_API_URL}/logout`)
      url.searchParams.set('logout_challenge', challenge)
      return ky.post(url.toString()).then(resp => resp.json())
    },
    getUser: async (token: string) => {
      const url = new URL(`${USERS_API_URL}/users/me`)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    update: async (id: number, body: any, token: string) => {
      const url = new URL(`${USERS_API_URL}/users/${id}`)
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
      const url = new URL(`${USERS_API_URL}/accounts`)
      url.searchParams.set('userId', userId)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    getAccount: async (token: string, id: number) => {
      const url = new URL(`${USERS_API_URL}/accounts/${id}`)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    getBalance: async (token: string) => {
      const url = new URL(`${USERS_API_URL}/users/me/balance`)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    getPaymentPointer: async (token: string) => {
      const url = new URL(`${USERS_API_URL}/users/me/paymentpointer`)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    getMonetizationBalance: async (token: string) => {
      const url = new URL(`${USERS_API_URL}/users/me/monetizationbalance`)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    }
  }
}

function handleError (statusCode: number, authErrorCallback?: () => void) {
  if ((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
