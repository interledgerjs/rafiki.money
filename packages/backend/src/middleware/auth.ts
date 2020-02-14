import { AppContext } from '../app'
import { HydraApi } from '../services/hydra'

export function createAuthMiddleware (hydra: HydraApi) {
  return async (ctx: AppContext, next: () => Promise<any>): Promise<void> => {
    const { header } = ctx
    ctx.logger.debug('Auth middleware.', { header })
    let token = ''

    // Get token out of header
    if (header && header.authorization) {
      const parts = header.authorization.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    ctx.assert(typeof token === 'string' && token !== '', 401, 'No auth token found.')

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

    await next()
  }
}
