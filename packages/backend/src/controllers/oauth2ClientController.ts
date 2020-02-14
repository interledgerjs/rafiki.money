import { Config, Joi } from 'koa-joi-router'
import { AppContext } from '../app'
import { hydra } from '../services/hydra'

export async function store (ctx: AppContext): Promise<void> {
  ctx.logger.info('Register Oauth2 client request', { body: ctx.request.body })
  const clientDetails = ctx.request.body

  try {
    const client = await hydra.createOauthClient(clientDetails)
    ctx.body = client
  } catch (error) {
    ctx.logger.error('Could not register client on oauth provider.', { error: error.response })
    ctx.status = 500
    ctx.message = 'Could not register client on oauth provider.'
  }
}

export function createValidation (): Config {
  return {
    validate: {
      type: 'json',
      body: Joi.object({
        client_id: Joi.string().required(),
        client_name: Joi.string().optional(),
        scope: Joi.string().optional(),
        logo_uri: Joi.string().optional(),
        response_types: Joi.array().items(Joi.string()).optional(),
        grant_types: Joi.array().items(Joi.string()).optional(),
        redirect_uris: Joi.array().items(Joi.string()).optional(),
        token_endpoint_auth_method: Joi.string().optional()
      })
    }
  }
}
