import { Context } from 'koa'
import { hydra } from '../services/hydra'

export async function store (ctx: Context): Promise<void> {
  const challenge = ctx.request.query.logout_challenge

  const acceptLogout = await hydra.acceptLogoutRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in accept login request')
    throw error
  })

  ctx.body = {
    redirectTo: acceptLogout['redirect_to']
  }
}
