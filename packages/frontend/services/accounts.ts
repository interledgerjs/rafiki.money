import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const ACCOUNTS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const AccountsService = (authErrorCallback?: () => void) => {
  return {
    getAccounts: async (token: string, userId: string) => {
      const url = new URL('accounts/', ACCOUNTS_API_URL)
      url.searchParams.set('userId', userId)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    },
    createAccount: async(token: string, name: string) => {
      const url = new URL('accounts/', ACCOUNTS_API_URL)
      return ky.post(url.toString(), {
        headers: { authorization: `Bearer ${token}` },
        json: {name}
      }).then(resp => resp.json())
    },
    // FIXME: Remove from production
    faucetAccount: async(token: string, accountId: string) => {
      const url = new URL('faucet/', ACCOUNTS_API_URL)
      return ky.post(url.toString(), {
        headers: { authorization: `Bearer ${token}` },
        json: {accountId}
      }).then(resp => resp.json())
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
