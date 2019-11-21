import bcrypt from 'bcrypt'
import { Context } from 'koa'
import { Config, Joi } from 'koa-joi-router'
import { User } from '../models/user'
import { hydra } from '../../src/services/hydra'
import { AppContext } from '../app'

export async function show (ctx: AppContext): Promise<void> {
  const challenge = ctx.request.query.login_challenge
  ctx.logger.debug('Get login request', { challenge })
  const loginRequest = await hydra.getLoginRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in login request')
    throw error
  })

  if (loginRequest['skip']) {
    const acceptLogin = await hydra.acceptLoginRequest(challenge, { subject: loginRequest['subject'],
      remember: true,
      remember_for: 604800 // 1 week
    }).catch(error => {
      ctx.logger.error(error, 'error in accept login request')
      throw error
    })
    ctx.status = 200
    ctx.body = { redirectTo: acceptLogin['redirect_to'] }
    return
  }

  ctx.status = 200
  ctx.body = { redirectTo: null }
}
export async function store (ctx: Context): Promise<void> {
  const { username, password } = ctx.request.body
  const challenge = ctx.request.query.login_challenge
  ctx.logger.debug('Post login request', { username: username, challenge })

  const user = await User.query().where('username', username).first()
  ctx.assert(user, 401, 'Invalid username or password.')

  ctx.assert(await bcrypt.compare(password, user!.password), 401, 'Invalid username or password.')

  const acceptLogin = await hydra.acceptLoginRequest(challenge, {
    subject: user!.id.toString(),
    remember: true,
    remember_for: 604800 // 1 week
  }).catch(error => {
    ctx.logger.error(error, 'error in accept login request')
    throw error
  })

  ctx.body = {
    redirectTo: acceptLogin['redirect_to']
  }
}

export function createValidation (): Config {
  return {
    validate: {
      type: 'json',
      query: {
        login_challenge: Joi.string().required().error(new Error('login_challenge is required.'))
      },
      body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
      })
    }
  }
}

export function getValidation (): Config {
  return {
    validate: {
      query: {
        login_challenge: Joi.string().required().error(new Error('login_challenge is required.'))
      }
    }
  }
}
