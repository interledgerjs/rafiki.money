import { IntrospectFunction } from '../../../src/services/auth'
import { TokenInfo } from '@interledger/rafiki-core'

export const introspectFunction: IntrospectFunction = (token: string): Promise<TokenInfo> => {
  if (token === 'good-token') {
    return Promise.resolve({
      active: true,
      sub: '1'
    })
  }
  if (token === 'bad-token') {
    return Promise.resolve({
      active: false,
      sub: '1'
    })
  }
  if (token === 'uplink-token') {
    return Promise.resolve({
      active: true,
      sub: 'uplink'
    })
  }
  return Promise.reject()
}
