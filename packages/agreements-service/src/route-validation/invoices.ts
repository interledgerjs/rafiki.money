import Router, { Config } from "koa-joi-router"

const Joi = Router.Joi
export const store: Config = {
  validate: {
    type: 'json',
    body: Joi.object({
      description: Joi.string().required(),
      amount: Joi.string().required(),
      currencyCode: Joi.string().required(),
      balance: Joi.string().required(),
      userId: Joi.string().required()
    })
  }
}
