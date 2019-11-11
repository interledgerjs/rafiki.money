import axios, { AxiosResponse } from 'axios'

const ACCOUNTS_API_URL = process.env.REACT_APP_WALLET_API_URL  || 'http://localhost:3000/api/'

type Resource = 'accounts' | 'transactions'

function post (resource: Resource, body: object, headers?: object) {
  const url = new URL(resource, ACCOUNTS_API_URL)
  return axios.post(url.toString(), body, { headers }).then(res => res.data)
}

function get (resource: Resource, resourceId: string, headers?: object, query: { [k: string]: string } = {}) {
  const url = new URL(resource + '/' + resourceId, ACCOUNTS_API_URL)
  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
  return axios.get(url.href, { headers }).then(res => res.data)
}

export const AccountsService = (authErrorCallback?: () => void) => {
  return {
    createAccount: async (name: string, authToken: string) => {
      return post('accounts', { name }, { Authorization: `Bearer ${authToken}` }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getAccount: async (accountId: string, authToken: string) => {
      return get('accounts', accountId, { Authorization: `Bearer ${authToken}` }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getAccounts: async (userId: string, authToken: string) => {
      const url = new URL('accounts', ACCOUNTS_API_URL)
      return axios.get(`${url.toString()}?userId=${userId}`, { headers: { Authorization: `Bearer ${authToken}` } }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getTransactions: async (accountId: string, authToken: string) => {
      const url = new URL('transactions', ACCOUNTS_API_URL)
      return axios.get(url.toString() + `?accountId=${accountId}&aggregateTime=30000`, { headers: { Authorization: `Bearer ${authToken}` } }).then(response => response.data).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    addFunds: async (accountId: string, authToken: string) => {
      const url = new URL('faucet', ACCOUNTS_API_URL)
      return axios.post(url.toString(), {
        accountId
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }).then(response => response.data)
        .catch(error => { handleError(error.response.status, authErrorCallback); return error })
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
