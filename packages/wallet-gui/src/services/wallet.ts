import axios, { AxiosResponse } from 'axios'

const WALLET_API_URL = process.env.REACT_APP_WALLET_API_URL || 'http://localhost:3000'

type Resource = 'accounts' | 'transactions' | 'token' | 'users' | 'agreements' | 'oauth/consent' | 'oauth/login'

function post (resource: Resource, body: object, headers?: object) {
  const url = new URL(resource, WALLET_API_URL)
  return axios.post(url.toString(), body, { headers }).then(res => res.data)
}

function get (resource: Resource, resourceId: string, headers?: object, query: { [k: string]: string } = {}) {
  const url = new URL(resource + '/' + resourceId, WALLET_API_URL)
  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]))
  return axios.get(url.href, { headers }).then(res => res.data)
}

export const WalletService = (authErrorCallback?: () => void) => {
  return {
    login: async (userName: string, password: string) => {
      return post('token', { userName, pssword: password })
    },
    signup: async (userName: string, password: string) => {
      return post('users', { userName, pssword: password })
    },
    createAccount: async (name: string, owner: string, authToken: string) => {
      return post('accounts', { name, owner }, { Authorization: `Bearer ${authToken}` }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getAccount: async (accountId: string, authToken: string) => {
      return get('accounts', accountId, { Authorization: `Bearer ${authToken}` }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getAccounts: async (userId: string, authToken: string) => {
      return axios.get(`${WALLET_API_URL}/accounts?owner=${userId}`, { headers: { Authorization: `Bearer ${authToken}` } }).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getTransactions: async (accountId: string, authToken: string) => {
      const url = new URL('transactions', WALLET_API_URL)
      return axios.get(url.toString() + `?account=${accountId}`, { headers: { Authorization: `Bearer ${authToken}` } }).then(response => response.data).catch(error => { handleError(error.response.status, authErrorCallback); return error })
    },
    getOauthLoginRequest: async (challenge: string) => {
      return get('oauth/login', '', {}, { 'login_challenge': challenge })
    },
    oauthLogin: async (userName: string, password: string, login_challenge: string) => {
      return post('oauth/login', { userName, password, login_challenge })
    },
    getConsent: async (challenge: string) => {
      return get('oauth/consent', '', {}, { 'consent_challenge': challenge })
    },
    handleConsent: async (body: object) => {
      return post('oauth/consent', body)
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
