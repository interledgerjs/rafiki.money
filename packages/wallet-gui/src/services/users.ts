import axios from 'axios'

const USERS_API_URL = process.env.REACT_APP_USERS_API_URL || 'http://localhost:3000/api/'

export const UsersService = (authErrorCallback?: () => void) => {
  return {
    signup: async (username: string, password: string) => {
      const url = new URL('users', USERS_API_URL)
      return axios.post(url.toString(), { username, password }).then(resp => resp.data)
    },
    getLogin: async (challenge: string) => {
      const url = new URL('login', USERS_API_URL)
      url.searchParams.set('login_challenge', challenge)
      return axios.get(url.toString()).then(resp => resp.data)
    },
    login: async (username: string, password: string, challenge: string) => {
      const url = new URL('login', USERS_API_URL)
      url.searchParams.set('login_challenge', challenge)
      return axios.post(url.toString(), { username, password }).then(resp => resp.data)
    },
    getConsent: async (challenge: string) => {
      const url = new URL('consent', USERS_API_URL)
      url.searchParams.set('consent_challenge', challenge)
      return axios.get(url.toString()).then(resp => resp.data)
    },
    handleConsent: async (challenge: string, body: object) => {
      const url = new URL('consent', USERS_API_URL)
      url.searchParams.set('consent_challenge', challenge)
      console.log('handling consent', body)
      return axios.post(url.toString(), body).then(resp => resp.data)
    },
    handleLogout: async (challenge: string) => {
      const url = new URL('logout', USERS_API_URL)
      url.searchParams.set('logout_challenge', challenge)
      console.log('handling logout')
      return axios.post(url.toString()).then(resp => resp.data)
    },
    getUser: async (token: string) => {
      const url = new URL('users/me', USERS_API_URL)
      return axios.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.data)
    },
    update: async (id: number, body: any, token: string) => {
      const url = new URL(`users/${id}`, USERS_API_URL)
      return axios.patch(url.toString(), body, { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.data)
    },
    registerOauth2Client: async (clientDetails: any, token: string) => {
      const url = new URL(`oauth2/clients`, USERS_API_URL)
      console.log('client data posting', clientDetails)
      return axios.post(url.toString(), clientDetails, { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.data)
    }
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
