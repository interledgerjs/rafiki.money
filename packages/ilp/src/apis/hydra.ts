import axios from 'axios'
import { TokenInfo } from '@interledger/rafiki-core'

const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:9001'
let mockTlsTermination = {}
const MOCK_TLS_TERMINATION = process.env.MOCK_TLS_TERMINATION || 'true'
if (MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    'X-Forwarded-Proto': 'https'
  }
}

export const hydra = {
  // Introspects the token
  introspectToken: function (token: string): Promise<TokenInfo> {
    const url = new URL('/oauth2/introspect', hydraAdminUrl)
    const introspectParams = new URLSearchParams()
    introspectParams.set('token', token)
    const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, mockTlsTermination)
    return axios.post<TokenInfo>(url.href, introspectParams, { headers }).then(resp => resp.data)
  }
}
