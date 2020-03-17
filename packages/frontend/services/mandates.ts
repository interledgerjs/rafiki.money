import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const MandatesService = (authErrorCallback?: () => void) => {
  return {
    getMandates: async (token: string) => {
      const url = new URL('mandates', USERS_API_URL)
      const resp = await ky.get(url.toString(),
        { headers: { authorization: `Bearer ${token}` } })
      return await resp.json()
    },
    getMandatesByMandateId: async (token: string, mandateId: string) => {
      const url = new URL(`mandates/${mandateId}/transactions`, USERS_API_URL)
      const resp = await ky.get(url.toString(),
        { headers: { authorization: `Bearer ${token}` } })
      return await resp.json()
    }
  }
}
