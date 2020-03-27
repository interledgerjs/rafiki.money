import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const TRANSACTIONS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const TransactionsService = (authErrorCallback?: () => void) => {
  return {
    getTransactionsByAccountId: async (token: string, accountId: string) => {
      const url = new URL('transactions/', TRANSACTIONS_API_URL)
      url.searchParams.set('accountId', accountId)
      return ky.get(url.toString(), {
        headers: { authorization: `Bearer ${token}` }
      }).then(resp => resp.json())
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
