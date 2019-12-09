import Router, { Config } from 'koa-joi-router'
const Joi = Router.Joi
export const store: Config = {
  validate: {
    type: 'json',
    body: Joi.object({
      scope: Joi.string().optional(),
      asset: Joi.object({
        code: Joi.string().required(),
        scale: Joi.number()
          .integer()
          .greater(0)
          .required()
      }).required(),
      amount: Joi.string().required(),
      cycles: Joi.number()
        .integer()
        .optional(),
      interval: Joi.string()
        .regex(
          /^P(?=\d+[YMWD])(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d+[HMS])(\d+H)?(\d+M)?(\d+S)?)?$/
        )
        .optional(),
      start: Joi.number()
        .integer()
        .greater(1284901492000)
        .optional(),
      expiry: Joi.number()
        .integer()
        .greater(1284901492000)
        .optional(),
      cap: Joi.bool().optional(),
      description: Joi.string().optional(),
      userId: Joi.number()
        .integer()
        .optional(),
      accountId: Joi.number()
        .integer()
        .optional(),
      subject: Joi.string().optional()
    })
  }
}

export const update: Config = {
  validate: {
    type: 'json',
    body: {
      userId: Joi.number()
        .integer()
        .optional(),
      accountId: Joi.number()
        .integer()
        .optional(),
      scope: Joi.string().optional(),
      cancelledAt: Joi.number()
        .integer()
        .greater(1284901492000)
        .optional()
    }
  }
}
