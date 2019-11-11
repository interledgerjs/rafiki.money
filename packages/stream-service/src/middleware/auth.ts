import { HydraApi } from '../apis/hydra'
import { StreamAppContext } from '../app'

export function createAuthMiddleware (hydraApi: HydraApi) {
  return async (ctx: StreamAppContext, next: () => Promise<any>): Promise<void> => {
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
    try {
      const introspection = await hydraApi.introspectToken(token)

      if (!introspection.active) {
        ctx.status = 401
        return
      }

      ctx.state.user = introspection
    } catch (error) {
      ctx.logger.debug('Error introspecting token', { error })
      ctx.status = 401
      return
    }

    await next()
  }
}
