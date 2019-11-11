import Router, { Config } from 'koa-joi-router'
const Joi = Router.Joi
export const store: Config = {
  validate: {
    type: 'json',
    body: Joi.object({
      scope: Joi.string().required(),
      asset: Joi.object({
        code: Joi.string().required(),
        scale: Joi.number().integer().greater(0).required()
      }).required(),
      callback: Joi.string().optional(),
      secret: Joi.string().when('callback', { is: Joi.exist(), then: Joi.forbidden().error(new Error('Specify either callback or secret.')), otherwise: Joi.required().error(new Error('Specify either callback or secret.')) })
    })
  }
}
