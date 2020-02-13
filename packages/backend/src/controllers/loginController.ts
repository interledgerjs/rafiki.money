import bcrypt from 'bcrypt'
import { Context } from 'koa'
import { Config, Joi } from 'koa-joi-router'
import { User } from '../models/user'
import { hydra } from '../../src/services/hydra'
import { AppContext } from '../app'
import { SignupSession } from '../models/signupSession'
import { ValidationError } from 'joi'
import { postUserSchema } from './userController'

export async function show (ctx: AppContext): Promise<void> {
  const challenge = ctx.query.login_challenge

  if (!challenge) {
    ctx.body = {
      message: 'Validation Failed',
      errors: [
        {
          field: 'login_challenge',
          message: 'login_challenge is required'
        }
      ]
    }
    ctx.status = 422
    return
  }

  ctx.logger.debug('Get login request', { challenge })
  const loginRequest = await hydra.getLoginRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in login request')
    throw error
  })

  if (loginRequest['request_url']) {
    const requestUrl = new URL(loginRequest['request_url'])
    const signupSessionId = requestUrl.searchParams.get('signupSessionId')

    const session = signupSessionId ? await SignupSession.query().where('id', signupSessionId).first() : null
    // Auto login users if they just signed up
    if (session) {
      const now = Date.now()
      if (session.expiresAt > now) {
        const acceptLogin = await hydra.acceptLoginRequest(challenge, { subject: session.userId,
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
    }
  }

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

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

export async function store (ctx: Context): Promise<void> {
  const { username, password } = ctx.request.body
  const challenge = ctx.query.login_challenge
  ctx.logger.debug('Post login request', { username: username, challenge })

  if (!challenge) {
    ctx.body = {
      message: 'Validation Failed',
      errors: [
        {
          field: 'login_challenge',
          message: 'login_challenge is required'
        }
      ]
    }
    ctx.status = 422
    return
  }

  try {
    await loginSchema.validate({ username, password })
  } catch (error) {
    const e: ValidationError = error
    ctx.body = {
      message: 'Validation Failed',
      errors: e.details.map(detail => {
        return {
          field: detail.context!.label,
          message: detail.message
        }
      })
    }
    ctx.status = 422
    return
  }

  const user = await User.query().where('username', username).first()

  if (!user) {
    ctx.body = {
      message: 'Validation Failed',
      errors: [
        {
          field: 'username',
          message: 'username does not exist'
        }
      ]
    }
    ctx.status = 422
    return
  }

  const passwordValid = await bcrypt.compare(password, user!.password)
  if (!passwordValid) {
    ctx.body = {
      message: 'Validation Failed',
      errors: [
        {
          field: 'password',
          message: 'invalid password'
        }
      ]
    }
    ctx.status = 422
    return
  }

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
