import { AppContext } from '../app'
import { Account } from '../models/account'
import { getOpenPaymentsInvoiceURL } from '../utils'
import got from 'got'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject
}

const createReceiverInvoice = async (paymentPointer: string, description = '') => {
  const url = await getOpenPaymentsInvoiceURL(paymentPointer)
  return got.post(url, {
    json: {
      subject: paymentPointer,
      description: description
    }
  }).json()
}

export async function store (ctx: AppContext): Promise<void> {
  const { streamService } = ctx
  const { body } = ctx.request
  const account = await Account.query().findById(body.accountId)

  if (!account) {
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  // Create Invoice at Receiver
  const invoice: any = await createReceiverInvoice(body.receiverPaymentPointer)

  // Get Payment details for invoice
  const invoiceUrl = 'https:' + invoice.name
  const paymentDetails: {ilpAddress: string, sharedSecret: string} = await got(invoiceUrl, {
    method: 'OPTIONS'
  }).json()

  // TODO how do we make this portion resilient?
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    await Account.transaction(async trx => {
      const trxAccount = await Account.query(trx).findById(account.id).forUpdate()

      if (!trxAccount) {
        throw new Error('Account not found')
      }

      const sent = await streamService.sendMoney(paymentDetails.ilpAddress, paymentDetails.sharedSecret, body.amount)

      const balance = trxAccount.balance
      const newBalance = balance - BigInt(sent)

      await Account.query(trx).findById(trxAccount.id).patch({
        balance: newBalance
      })

      await trxAccount.$relatedQuery('transactions', trx).insert({
        amount: -BigInt(sent),
        description: body.description
      })
    })

    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}
