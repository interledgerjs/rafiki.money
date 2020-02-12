import { AppContext } from '../app'
import { HydraApi } from '../services/hydra'

export function createAttemptAuthMiddleware (hydra: HydraApi) {
  return async (ctx: AppContext, next: () => Promise<any>): Promise<void> => {
    const { header } = ctx
    ctx.logger.debug('Attempt auth middleware.', { header })
    let token = ''

    // Get token out of header
    if (header && header.authorization) {
      const parts = header.authorization.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    if (typeof token === 'string' && token !== '') {
      const introspection = await hydra.introspectToken(token).catch(error => {
        ctx.logger.error('error introspecting token', { errorResponse: error })
        throw error
      })

      ctx.logger.debug('Introspected token', { introspection })

      if (!introspection.active) {
        ctx.status = 401
        return
      }

      // Assign userId from token sub to ctx.user
      ctx.state.user = introspection
    }

    await next()
  }
}
