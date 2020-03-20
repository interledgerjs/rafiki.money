import axios from 'axios'
import { Transaction as KnexTransaction, ref, raw } from 'objection'
import { AppContext } from '../app'
import { Mandate, Transaction, Account } from '../models'
import { Charge } from '../models/charge'

const INVOICE_URL_PROTOCOL = process.env.INVOICE_PROTOCOL || 'http'

const enforce = (subject: string, authorizationDetail: AuthorizationDetail, mandate: Mandate): boolean => {
  return mandate.userId.toString() === subject && authorizationDetail.actions.some(action => action === 'charge') && authorizationDetail.locations[0] === mandate.toJSON().name
}

export async function store (ctx: AppContext): Promise<void> {
  ctx.logger.debug(`Charges Controller: Creating charge for mandate ${ctx.params.id}: ${ctx.request.body}`)
  const mandate = await Mandate.query().findById(ctx.params.id)

  if (!mandate) {
    ctx.status = 404
    return
  }

  const mandateAuthorizationDetails = ctx.state.user.ext.authorization_details.filter((details: AuthorizationDetail) => details.type === 'open_payments_mandate')
  if (!enforce(ctx.state.user.sub, mandateAuthorizationDetails.length > 0 ? mandateAuthorizationDetails[0] : [], mandate)) {
    ctx.status = 401
    return
  }

  const existingCharge = await mandate.$relatedQuery<Charge>('charges').where('invoice', ctx.request.body.invoice).first()
  if (existingCharge) {
    ctx.status = 201
    ctx.body = existingCharge.toJSON()
    return
  }

  const invoiceURL = `${INVOICE_URL_PROTOCOL}:${ctx.request.body.invoice}`
  const { data: { sharedSecret, ilpAddress } } = await axios.options<{ sharedSecret: string, ilpAddress: string }>(invoiceURL)
  const { data } = await axios.get(invoiceURL)

  let charge: Charge
  // TODO: currency and scale conversion
  const amountSent = await ctx.streamService.sendMoney(ilpAddress, sharedSecret, data.amount)
  await Transaction.transaction(async (trx: KnexTransaction) => {
    charge = await mandate.$relatedQuery<Charge>('charges', trx).insertAndFetch({ invoice: ctx.request.body.invoice })
    await Account.query(trx).where('id', mandate.accountId).patch({ balance: raw('? - ?', [ ref('accounts.balance'), amountSent ]) })
    await Transaction.query(trx).insert({ accountId: mandate.accountId, amount: BigInt(amountSent), description: data.description || 'Payment for ' + ctx.request.body.invoice })
    await mandate.$query(trx).patch({ balance: raw('? - ?', [ ref('mandates.balance'), amountSent ]) })
  })

  ctx.status = 201
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ctx.body = charge!.toJSON()
}
