import got from 'got'

const HTTP_PROTOCOL = process.env.HTTP_PROTOCOL || 'http'

export const paymentPointerToURL = (paymentPointer: string): string => {
  if (paymentPointer.startsWith('http') || paymentPointer.startsWith('https')) {
    return paymentPointer
  }

  if (paymentPointer.startsWith('$')) {
    return paymentPointer.replace('$', `${HTTP_PROTOCOL}://`)
  }
  throw new Error('Invalid Payment Pointer format')
}

export const getOpenPaymentsInvoiceURL = async (paymentPointer: string): Promise<string> => {
  const url = new URL(paymentPointerToURL(paymentPointer))
  const openPaymentsUrl = url.origin + '/.well-known/open-payments'
  const { body } = await got.get(openPaymentsUrl)
  const jsonBody = JSON.parse(body)
  return jsonBody.invoices_endpoint
}

const PAYMENT_POINTER_ROOT = '$localhost:3001/p/'

export const paymentPointerToIdentifier = (paymentPointer: string): string => {
  return paymentPointer.replace(PAYMENT_POINTER_ROOT, '')
}

export const identifierToPaymentPointer = (identifier: string): string => {
  return PAYMENT_POINTER_ROOT + identifier
}
