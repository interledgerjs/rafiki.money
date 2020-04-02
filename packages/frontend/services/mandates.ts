import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const MandatesService = (authErrorCallback?: () => void) => {
  return {
    getUserMandates: async (state: string, token: string) => {
      const url = new URL('/mandates', USERS_API_URL)
      url.searchParams.append('state', state)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    },
    getMandatesByMandateId: async (token: string, mandateId: string) => {
      const url = new URL(`mandates/${mandateId}/transactions`, USERS_API_URL)
      const resp = await ky.get(url.toString(),
        { headers: { authorization: `Bearer ${token}` } })
      return await resp.json()
    },
    cancelMandate: async (mandateId: string, token: string) => {
      const url = new URL(`/mandates/${mandateId}/cancel`, USERS_API_URL)
      return ky.put(url.toString(),{
        headers: { authorization: `Bearer ${token}` } })
    },
  }
}

function handleError(statusCode: number, authErrorCallback?: () => void) {
  if((statusCode === 401 || statusCode === 403) && authErrorCallback) {
    authErrorCallback()
  }
}
