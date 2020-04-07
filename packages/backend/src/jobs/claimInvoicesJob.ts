import { Account, Invoice } from '../models'

export const claimInvoices = async () => {
  // Get all invoices that are expiredAt but not moved
  const invoices = await Invoice.query().where('expiresAt', '<', new Date()).whereNull('finalizedAt')
  const modifications = invoices.map(invoice => {
    return Invoice.transaction(async trx => {
      const lockedInvoice = await Invoice.query(trx).findById(invoice.id).forUpdate()
      const lockedAccount = await Account.query(trx).findById(invoice.accountId).forUpdate()

      const invoiceAmountReceived = BigInt(lockedInvoice.received)
      const balance = BigInt(lockedAccount.balance)
      const newBalance = balance + invoiceAmountReceived

      await Account.query(trx).findById(lockedAccount.id).patch({
        balance: newBalance
      })

      await lockedAccount.$relatedQuery('transactions', trx).insert({
        amount: invoiceAmountReceived,
        description: `Payment for Invoice ${lockedInvoice.id}`
      })
      await lockedInvoice.$query(trx).patch({
        finalizedAt: (new Date()).toISOString()
      })
    }).catch(error => {
      console.log(error)
    })
  })
  return Promise.all(modifications)
}

export const run = (): NodeJS.Timeout => {
  return setInterval(claimInvoices, 5000)
}
