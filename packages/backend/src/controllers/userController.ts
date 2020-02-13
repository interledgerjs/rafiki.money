import bcrypt from 'bcrypt'
import { Context } from 'koa'
import { User } from '../models/user'
import { Config, Joi } from 'koa-joi-router'
import { AppContext } from '../app'
import { SignupSession } from '../models/signupSession'
import { ValidationError } from 'joi'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Get me request')
  ctx.assert(ctx.state.user && ctx.state.user.sub, 401)

  const user = await User.query().where('id', ctx.state.user.sub).first()
  ctx.assert(user, 404, 'User not found')

  ctx.body = user!.$formatJson()
}

export const postUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})

export async function store (ctx: AppContext): Promise<void> {
  const { username, password } = ctx.request.body
  ctx.logger.debug(`Creating user ${username}`)

  try {
    await postUserSchema.validate({ username, password })
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

  const salt = await bcrypt.genSalt()
  const hashedPassword = bcrypt.hashSync(password, salt)

  const usersWithUsername = await User.query().where('username', username).first()
  if (usersWithUsername) {
    ctx.body = {
      message: 'Validation Failed',
      errors: [
        {
          field: 'username',
          message: 'Username exists already'
        }
      ]
    }
    ctx.status = 422
    return
  }

  const user = await User.query().insertAndFetch({ username, password: hashedPassword })
  const expiresAt = BigInt((new Date(Date.now() + 1000 * 30)).getTime())
  const signupSession = await SignupSession.query().insertAndFetch({ userId: user.id, expiresAt })
  ctx.body = {
    ...user.$formatJson(),
    signupSessionId: signupSession.id
  }
}

export async function update (ctx: AppContext): Promise<void> {
  const { body } = ctx.request
  const { id } = ctx.params

  ctx.logger.debug('Updating user', { userId: id })

  if (id !== ctx.state.user.sub) {
    ctx.status = 403
    return
  }

  const user = await User.query().findById(id)
  ctx.assert(user, 404)

  if (body.password) {
    const salt = await bcrypt.genSalt()
    const hashedPassword = bcrypt.hashSync(ctx.request.body.password, salt)
    await user!.$query().update({ password: hashedPassword })
  }

  if (body.defaultAccountId) {
    await user!.$query().update({ defaultAccountId: body.defaultAccountId })
  }

  ctx.response.status = 200
}

export function createValidation (): Config {
  return {
    validate: {
      type: 'json',
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
      })
    }
  }
}
