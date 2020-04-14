import ky from 'ky-universal'
import getConfig from 'next/config'
import { formatCurrency } from '../utils'

const {publicRuntimeConfig} = getConfig()
const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export async function pay(paymentPointer: string, amount: number, accountId: number, type: string, token: string) {
  const url = new URL(`${USERS_API_URL}/payments/peer`)
  const formattedAmount = (amount*10**(6)).toFixed(0)
  return ky.post(url.toString(),
    {
      json: {
        accountId,
        amount: formattedAmount,
        type,
        receiverPaymentPointer: paymentPointer
      },
      headers:
        {authorization: `Bearer ${token}`}
    })
}

export async function payInvoice(invoice: string, amount: number, accountId: number, token: string) {
  const url = new URL(`${USERS_API_URL}/payments/invoice`)
  return ky.post(url.toString(),
    {
      json: {
        accountId,
        invoice,
        amount
      },
      headers:
        {authorization: `Bearer ${token}`}
    })
}
