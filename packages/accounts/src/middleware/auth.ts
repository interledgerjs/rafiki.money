import { AccountsAppContext } from '../index'
import { HydraApi } from '../apis/hydra'

export function createAuthMiddleware (hydraApi: HydraApi) {
  return async (ctx: AccountsAppContext, next: () => Promise<any>): Promise<void> => {
    const { header } = ctx
    let token = ''

    // Get token out of header
    if (header && header.authorization) {
      const parts = header.authorization.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    // Introspect it
    const introspection = await hydraApi.introspectToken(token).catch(error => {
      ctx.logger.debug('Error introspecting token', { error: error.response })
      throw error
    })

    if (!introspection.active) {
      ctx.status = 401
      return
    }

    ctx.state.user = introspection

    await next()
  }
}
