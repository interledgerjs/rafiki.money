import axios from 'axios'
import querystring from 'querystring'

const hydraUrl = process.env.HYDRA_URL || 'http://localhost:9000'
const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:9001'
let mockTlsTermination = {}
const MOCK_TLS_TERMINATION = process.env.MOCK_TLS_TERMINATION || 'true'
if (MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    'X-Forwarded-Proto': 'https'
  }
}

type Flow = 'login' | 'consent' | 'logout'
type Action = 'accept' | 'reject'

// A little helper that takes type (can be "login" or "consent") and a challenge and returns the response from ORY Hydra.
function get (flow: Flow, challenge: string): Promise<any> {
  const url = new URL('/oauth2/auth/requests/' + flow, hydraAdminUrl)
  url.search = querystring.stringify({ [flow + '_challenge']: challenge })
  return axios.get(url.toString(), {
    headers: mockTlsTermination,
    timeout: 5000
  }).then(res => {
    return res.data
  })
}

// A little helper that takes type (can be "login" or "consent"), the action (can be "accept" or "reject") and a challenge and returns the response from ORY Hydra.
function put (flow: Flow, action: Action, challenge: string, body: any): Promise<any> {
  const url = new URL('/oauth2/auth/requests/' + flow + '/' + action, hydraAdminUrl)
  url.search = querystring.stringify({ [flow + '_challenge']: challenge })
  const headers = Object.assign({ 'Content-Type': 'application/json' }, mockTlsTermination)
  return axios.put(url.toString(), body, {
    headers,
    timeout: 5000
  }).then(res => res.data)
}

export const hydra = {
  // Fetches information on a login request.
  getLoginRequest: function (challenge: string): Promise<any> {
    return get('login', challenge)
  },
  // Accepts a login request.
  acceptLoginRequest: function (challenge: string, body: any): Promise<any> {
    return put('login', 'accept', challenge, body)
  },
  // Rejects a login request.
  rejectLoginRequest: function (challenge: string, body: any): Promise<any> {
    return put('login', 'reject', challenge, body)
  },
  // Fetches information on a consent request.
  getConsentRequest: function (challenge: string): Promise<any> {
    return get('consent', challenge)
  },
  // Accepts a consent request.
  acceptConsentRequest: function (challenge: string, body: any): Promise<any> {
    return put('consent', 'accept', challenge, body)
  },
  // Rejects a consent request.
  rejectConsentRequest: function (challenge: string, body: any): Promise<any> {
    return put('consent', 'reject', challenge, body)
  },
  // Fetches information on a logout request.
  getLogoutRequest: function (challenge: string): Promise<any> {
    return get('logout', challenge)
  },
  // Accepts a logout request.
  acceptLogoutRequest: function (challenge: string): Promise<any> {
    return put('logout', 'accept', challenge, {})
  },
  // Reject a logout request.
  rejectLogoutRequest: function (challenge: string): Promise<any> {
    return put('logout', 'reject', challenge, {})
  },
  // Introspects the token
  introspectToken: function (token: string): Promise<any> {
    const url = new URL('/oauth2/introspect', hydraAdminUrl)
    const introspectParams = new URLSearchParams()
    introspectParams.set('token', token)
    const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, mockTlsTermination)
    return axios.post(url.href, introspectParams, { headers }).then(resp => resp.data)
  },
  createToken: function (params: URLSearchParams): Promise<any> {
    const url = new URL('/oauth2/token', hydraUrl)
    return axios.post(url.toString(), params, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    }).then(resp => resp.data)
  }
}
