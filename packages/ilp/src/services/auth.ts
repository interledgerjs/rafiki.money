import { hydra } from '../apis/hydra'
import { TokenInfo } from '@interledger/rafiki-core'

export type IntrospectFunction = (token: string) => Promise<TokenInfo>

export async function hydraIntrospection (token: string): Promise<TokenInfo> {
  try {
    if (token.startsWith('peer_')) {
      return {
        active: true,
        sub: 'uplink'
      }
    }

    return await hydra.introspectToken(token)
  } catch (error) {
    return {
      active: false
    }
  }
}
