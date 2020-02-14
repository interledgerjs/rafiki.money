import { hydra } from '../../src/services/hydra'

export const mockAuth = () => {
  hydra.introspectToken = jest.fn().mockImplementation(async (token: string) => {


    if(token.startsWith('user_')) {
      return {
        active: true,
        scope: 'offline openid',
        sub: token.substring(5),
        token_type: 'access_token'
      }
    }

    return {
      active: false
    }
  })
}
