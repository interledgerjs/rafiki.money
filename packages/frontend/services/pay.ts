import ky from 'ky-universal'
import { parseCookies } from 'nookies'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

export async function pay(paymentPointer: string, amount: any, account: any, token: string) {

    const body = {
        amount: amount,
        assetScale: account.assetScale,
        assetCode: account.assetScale,
        description: 'send a payment',
        subject: paymentPointer
    }

    let url = new URL('/.well-known/open-payments', USERS_API_URL)
    const getPaymentPointerMetadata = await ky.get(url.toString()).then(resp => resp.json())
    const invoices_endpoint = getPaymentPointerMetadata.invoices_endpoint
    const createInvoice = await ky.post(invoices_endpoint, { json: body, headers: { authorization: `Bearer ${token}` } }).then(resp => resp.json())
    const getInvoice = await ky.get(createInvoice.name).then(resp => resp.json())

    const transaction = {
        amount: amount,
        accountId: account.id,
        description: 'send a payment'
    }
    url = new URL('/transactions', USERS_API_URL)
    const createTransaction = await ky.post(url.toString(), { json: transaction, headers: { authorization: `Bearer ${token}` } })
}