import axios from 'axios'
import { Transaction as KnexTransaction, Model } from 'objection'
import { AppContext } from '../app'
import { Mandate, Account, Charge } from '../models'
import { MandateTransaction } from '../models/mandateTransaction'
import { MandateInterval } from '../models/mandateInterval'

const INVOICE_URL_PROTOCOL = process.env.INVOICE_PROTOCOL || 'http'

const enforce = (subject: string, authorizationDetail: AuthorizationDetail, mandate: Mandate): boolean => {
  return mandate.userId.toString() === subject && authorizationDetail.actions.some(action => action === 'charge') && authorizationDetail.locations[0] === mandate.toJSON()['name']
}

const modifyAccountBalance = async (accountId: number, amount: bigint, trx: KnexTransaction, description = ''): Promise<void> => {
  const trxAccount = await Account.query(trx).findById(accountId).forUpdate()

  if (!trxAccount) {
    throw new Error('Account not found')
  }

  const balance = BigInt(trxAccount.balance)
  const limit = trxAccount.limit
  const newBalance = balance + amount

  if (newBalance < limit) {
    throw new Error('Insufficient Funds')
  }

  await Account.query(trx).findById(trxAccount.id).patch({
    balance: newBalance
  })

  await trxAccount.$relatedQuery('transactions', trx).insert({
    amount,
    description
  })
}

const modifyMandateIntervalBalance = async (mandate: Mandate, interval: MandateInterval, amount: bigint, trx: KnexTransaction, description = '', chargeId?: string): Promise<void> => {
  const lockedInterval = await MandateInterval.query().findById(interval.id).forUpdate()

  const spent = BigInt(lockedInterval.used)
  const newSpent = spent + amount

  if (newSpent > mandate.amount) {
    throw new Error('Insufficient Funds')
  }

  await lockedInterval.$query(trx).patch({
    used: newSpent
  })

  await mandate.$relatedQuery<MandateTransaction>('transactions', trx).insert({
    accountId: mandate.accountId,
    amount,
    mandateIntervalId: lockedInterval.id,
    chargeId,
    description
  })
}

export async function store (ctx: AppContext): Promise<void> {
  ctx.logger.debug(`Charges Controller: Creating charge for mandate ${ctx.params.id}: ${ctx.request.body}`)
  const mandate = await Mandate.query().findById(ctx.params.id)

  if (!mandate || !ctx.state.user.ext.authorization_details) {
    ctx.status = 404
    return
  }

  if (mandate.cancelledAt !== null) {
    ctx.status = 422
    ctx.message = 'Mandate cancelled'
    return
  }

  const mandateAuthorizationDetails = ctx.state.user.ext.authorization_details.filter((details: AuthorizationDetail) => details.type === 'open_payments_mandate')
  if (!enforce(ctx.state.user.sub, mandateAuthorizationDetails.length > 0 ? mandateAuthorizationDetails[0] : [], mandate)) {
    ctx.status = 401
    return
  }

  const existingCharge = await mandate.$relatedQuery<Charge>('charges').where('invoice', ctx.request.body.invoice).first()
  // TODO: what if charge is only partially paid?
  if (existingCharge) {
    ctx.status = 201
    ctx.body = existingCharge.toJSON()
    return
  }

  const invoiceURL = `${INVOICE_URL_PROTOCOL}:${ctx.request.body.invoice}`
  const { data: { sharedSecret, ilpAddress } } = await axios.options<{ sharedSecret: string, ilpAddress: string }>(invoiceURL)
  const { data } = await axios.get(invoiceURL)
  const amount = BigInt(data.amount) // TODO: currency and scale conversion

  let charge: Charge
  const mandateInterval = await mandate.currentInterval()
  try {
    // lock liquidity for mandate and account
    const description = data.description || 'Payment for ' + ctx.request.body.invoice
    await Model.transaction(async (trx) => {
      charge = await mandate.$relatedQuery<Charge>('charges').insertAndFetch({ invoice: ctx.request.body.invoice })
      await modifyAccountBalance(mandate.accountId, -amount, trx, description)
      await modifyMandateIntervalBalance(mandate, mandateInterval, amount, trx, description)
    })
  } catch (error) {
    if (error.message === 'Insufficient Funds') {
      ctx.status = 422
      ctx.message = 'Insufficient Balance'
      return
    }
    ctx.status = 500
    return
  }

  try {
    const amountSent = await ctx.streamService.sendMoney(ilpAddress, sharedSecret, amount.toString())
    if (amountSent < amount) {
      const difference = amount - amountSent
      const reversalDescription = 'Reversal of amount not sent for ' + ctx.request.body.invoice
      await Model.transaction(async (trx) => {
        await modifyAccountBalance(mandate.accountId, difference, trx, reversalDescription)
        await modifyMandateIntervalBalance(mandate, mandateInterval, -difference, trx, reversalDescription)
      })
    }

    if (amountSent > amount) {
      // What to do here?
      console.log('Over payment occured.')
    }

    // TODO add amount sent in the charge

    ctx.status = 201
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ctx.body = charge!.toJSON()
  } catch (error) {
    ctx.status = 500
  }
}
