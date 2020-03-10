import ky from 'ky-universal'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export const MandatesService = (authErrorCallback?: () => void) => {
  return {
    getMandates: async () => {
      const url = new URL('mandates', USERS_API_URL)
      return ky.get(url.toString(), {
        json: {}
      }).then(resp => resp.json())
    }
  }
}
