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
    createAccount: async(token: string, accountName: string) => {
      const url = new URL('accounts/', ACCOUNTS_API_URL)
      return ky.post(url.toString(), {
        json: {accountName}
      }).then(resp => resp.json())
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
