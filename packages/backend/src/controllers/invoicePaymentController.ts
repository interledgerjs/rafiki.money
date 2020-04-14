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

const getInvoicePaymentDetails = async (invoiceName: string): Promise<any> => {
  let url = ''
  if (invoiceName.startsWith('http') || invoiceName.startsWith('https')) {
    url = invoiceName
  } else if (invoiceName.startsWith('//')) {
    url = `${HTTP_PROTOCOL}:${invoiceName}`
  }

  return got(url, {
    method: 'OPTIONS'
  }).then(async response => {
    const body = await response.body
    const json = JSON.parse(body)
    if (!json.ilpAddress) {
      throw new Error('Invalid invoice')
    }
    return json
  })
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

  const paymentDetails: { ilpAddress: string, sharedSecret: string } = await getInvoicePaymentDetails(body.invoice)

  // TODO this code needs to be made more resilient
  try {
    await modifyBalance(account.id, -amount, `Paying Invoice ${body.receiverPaymentPointer}`)

    const sent = await streamService.sendMoney(paymentDetails.ilpAddress, paymentDetails.sharedSecret, amount.toString())

    if (sent !== amount) {
      logger.error('Failed to send full amount', { amount: amount.toString(), sent: sent.toString() })
      const amountNotSent = amount - sent
      await modifyBalance(account.id, amountNotSent, `Refund for Paying Invoice ${body.receiverPaymentPointer}`)
    }

    ctx.body = {
      sent: sent.toString()
    }
    ctx.status = 201
  } catch (error) {
    console.log(error)
  }
}
