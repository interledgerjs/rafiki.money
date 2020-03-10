import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const MandatesService = (authErrorCallback?: () => void) => {
  return {
    getMandates: async (token: string) => {
      const url = new URL('mandates', USERS_API_URL)
      return ky.get(url.toString(),
        { headers: { authorization: `Bearer ${token}` } }
      ).then(resp => resp.json())
    },
    getUser: async (token: string) => {
      const url = new URL('users/me', USERS_API_URL)
      return ky.get(url.toString(), { headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    }
  }
}
