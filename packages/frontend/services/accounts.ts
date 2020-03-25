import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const AccountsService = (authErrorCallback?: () => void) => {
  return {
    getUserAccounts: async (userId: string, token: string) => {
      const url = new URL('/accounts', USERS_API_URL)
      url.searchParams.append('userId', userId)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    create: async (name: string, token: string) => {
      const url = new URL('/accounts', USERS_API_URL)
      return ky.post(url.toString(), {
        json: {
          name
        },
        headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    faucet: async (accountId: number, token: string) => {
      const url = new URL('/faucet', USERS_API_URL)
      return ky.post(url.toString(), {
        json: {
          accountId
        },
        headers: { authorization: `Bearer ${token}` } })
    },
    transactions: async (accountId: string, token: string) => {
      const url = new URL(`/accounts/${accountId}/transactions`, USERS_API_URL)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
