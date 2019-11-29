import axios from 'axios'

const ISHARA_API_URL =
  process.env.REACT_APP_WALLET_API_URL || 'http://localhost:3000/api/'

export const ishara = {
  getMandates: async (user: string, state?: string) => {
    const url = new URL('mandates', ISHARA_API_URL)
    return axios
      .get(
        url.toString() + `?userId=${user}` + (state ? `&state=${state}` : '')
      )
      .then(response => response.data)
  },
  getMandate: async (id: string) => {
    const url = new URL(`mandates/${id}`, ISHARA_API_URL)
    return axios.get(url.toString()).then(response => response.data)
  },
  getConsent: async (challenge: string) => {
    const url = new URL('oauth/consent', ISHARA_API_URL)
    return axios
      .get(url.toString() + `?consent_challenge=${challenge}`)
      .then(response => response.data)
  },
  acceptConsent: async (body: object) => {
    const url = new URL('oauth/consent', ISHARA_API_URL)
    return axios.post(url.toString(), body).then(response => response.data)
  },
  addFunds: async (accountId: string) => {
    const url = new URL('faucet', ISHARA_API_URL)
    return axios
      .post(url.toString(), {
        accountId
      })
      .then(response => response.data)
  },
  cancelAgreement: async (agreementId: string) => {
    let timestamp = new Date().getTime()
    const url = new URL(`mandates/${agreementId}`, ISHARA_API_URL)
    return axios.patch(url.toString(), { cancelled: timestamp })
  }
}
