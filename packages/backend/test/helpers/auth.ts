import { hydra } from '../../src/services/hydra'
type AuthorizationDetail = {
  type: string,
  locations: Array<string>,
  actions: string[]
}
export const mockAuth = (authorizationDetails?: AuthorizationDetail[]) => {
  hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {
    if (token.startsWith('user_')) {
      return {
        active: true,
        scope: 'offline openid',
        sub: token.substring(5),
        token_type: 'access_token',
        ext: authorizationDetails ? { authorization_details: authorizationDetails } : {}
      }
    }

    return {
      active: false
    }
  })
}
