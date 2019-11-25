import bcrypt from 'bcrypt'
import { Context } from 'koa'
import { User } from '../models/user'
import { Config, Joi } from 'koa-joi-router'
import { AppContext } from '../app'

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Get me request')
  ctx.assert(ctx.state.user && ctx.state.user.sub, 401)

  const user = await User.query().where('id', ctx.state.user.sub).first()
  ctx.assert(user, 404, 'User not found')

  ctx.body = user!.$formatJson()
}

export async function store (ctx: AppContext): Promise<void> {
  const { username, password } = ctx.request.body
  ctx.logger.debug(`Creating user ${username}`)
  const salt = await bcrypt.genSalt()
  const hashedPassword = bcrypt.hashSync(password, salt)

  const usersWithUsername = await User.query().where('userName', username)
  ctx.assert(usersWithUsername.length === 0, 400, 'Username is already taken.')

  const user = await User.query().insertAndFetch({ username, password: hashedPassword })
  ctx.body = user.$formatJson()
}

export async function update (ctx: Context): Promise<void> {
  const { body } = ctx.request
  ctx.logger.debug(`Updating user ${ctx.request.params.id}`)
  const user = await User.query().findById(ctx.request.params.id)
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
