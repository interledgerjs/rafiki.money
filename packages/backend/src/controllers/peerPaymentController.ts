import { AppContext } from '../app'
import { Account } from '../models/account'
import { getOpenPaymentsInvoiceURL, paymentPointerToURL } from '../utils'
import got from 'got'

const HTTP_PROTOCOL = process.env.HTTP_PROTOCOL || 'http'

const enforce = (subject: string, account: Account): boolean => {
  return account.userId.toString() === subject
}

const checkSufficientBalance = async (accountId: number, amount: bigint): Promise<boolean> => {
  return Account.transaction(async trx => {
    const trxAccount = await Account.query(trx).findById(accountId).forUpdate()

    if (!trxAccount) {
      await trx.rollback()
      throw new Error('Account not found')
    }

    const balance = BigInt(trxAccount.balance)
    const limit = trxAccount.limit
    const newBalance = balance + amount

    return (newBalance > limit)
  })
}

const modifyBalance = async (accountId: number, amount: bigint, description = '') => {
  await Account.transaction(async trx => {
    const trxAccount = await Account.query(trx).findById(accountId).forUpdate()

    if (!trxAccount) {
      await trx.rollback()
      throw new Error('Account not found')
    }

    const balance = BigInt(trxAccount.balance)
    const limit = trxAccount.limit
    const newBalance = balance + amount

    if (newBalance < limit) {
      trx.rollback()
      throw new Error('Insufficient Funds')
    }

    await Account.query(trx).findById(trxAccount.id).patch({
      balance: newBalance
    })

    await trxAccount.$relatedQuery('transactions', trx).insert({
      amount: amount,
      description: description
    })
  })
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
  const { streamService, logger } = ctx
  const { body } = ctx.request
  const account = await Account.query().findById(body.accountId)

  if (!account) {
    return
  }

  if (!body.amount) {
    ctx.status = 422
    ctx.body = {
      message: 'Amount must be specified'
    }
    return
  }

  if (!enforce(ctx.state.user.sub, account)) {
    ctx.status = 403
    return
  }

  const amount = BigInt(body.amount)
  if (amount <= 0n) {
    ctx.status = 422
    ctx.body = {
      message: 'Amount must be a positive integer'
    }
    return
  }

  // Take out money to send
  const isSufficientFunds = await checkSufficientBalance(account.id, -amount)

  if (!isSufficientFunds) {
    ctx.status = 422
    ctx.body = {
      message: 'Insufficient Funds'
    }
    return
  }

  let paymentDetails: {ilpAddress: string, sharedSecret: string}
  if (body.type === 'open-payments') {
    // Create Invoice at Receiver
    const invoice: any = await createReceiverInvoice(body.receiverPaymentPointer)

    // Get Payment details for invoice
    const invoiceUrl = `${HTTP_PROTOCOL}:${invoice.name}`
    paymentDetails = await got(invoiceUrl, {
      method: 'OPTIONS'
    }).json()
  } else if (body.type === 'spsp') {
    const url = new URL(paymentPointerToURL(body.receiverPaymentPointer))
    url.pathname += '/.well-known/pay'
    const spspUrl = url.toString()
    const response = await got.get(spspUrl, {
      headers: {
        'Accept': 'application/spsp4+json'
      }
    })
    const jsonBody = JSON.parse(response.body)
    paymentDetails = {
      ilpAddress: jsonBody.destination_account,
      sharedSecret: jsonBody.shared_secret
    }
  } else {
    ctx.status = 422
    ctx.body = {
      message: 'Payment Type Required'
    }
    return
  }

  // TODO this code needs to be made more resilient
  try {
    await modifyBalance(account.id, -amount, `Payment to ${body.receiverPaymentPointer}`)

    const sent = await streamService.sendMoney(paymentDetails.ilpAddress, paymentDetails.sharedSecret, amount.toString())

    if (sent !== amount) {
      logger.error('Failed to send full amount', { amount: amount.toString(), sent })
      const amountNotSent = amount - sent
      await modifyBalance(account.id, amountNotSent, `Refund for amount not sent to ${body.receiverPaymentPointer}`)
    }

    ctx.body = {
      sent: sent.toString()
    }
    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}
