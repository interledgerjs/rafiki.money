import axios from 'axios'

const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:9001'
let mockTlsTermination = {}
const MOCK_TLS_TERMINATION = process.env.MOCK_TLS_TERMINATION || 'true'
if (MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    'X-Forwarded-Proto': 'https'
  }
}

export interface TokenInfo {
  active: boolean;
  scope?: string;
  client_id?: string;
  username?: string;
  token_type?: string;
  exp?: number;
  iat?: number;
  nbf?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;
}

export interface HydraApi {
  introspectToken: (token: string) => Promise<TokenInfo>;
}

export const hydraApi: HydraApi = {
  // Introspects the token
  introspectToken: function (token: string) {
    const url = new URL('/oauth2/introspect', hydraAdminUrl)
    const introspectParams = new URLSearchParams()
    introspectParams.set('token', token)
    const headers = Object.assign({ 'content-type': 'application/x-www-form-urlencoded' }, mockTlsTermination)
    return axios.post<TokenInfo>(url.href, introspectParams, { headers }).then(resp => resp.data)
  }
}
