import axios, { AxiosResponse } from 'axios'

const accountsUrl = process.env.ACCOUNTS_URL || 'http://localhost:3001'

export const accounts = {
  async getUserAccounts (userId: string, token: string): Promise<AxiosResponse> {
    const url = new URL(`accounts?userId=${userId}`, accountsUrl)
    return axios.get(url.toString(), {
      headers: {
        authorization: 'Bearer ' + token
      },
      timeout: 5000
    }).then(resp => resp.data)
  }
}
