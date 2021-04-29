import { AppContext } from '../app'
import got from 'got'

const getInvoice = async (invoiceName: string): Promise<any> => {
  let url = ''
  if (invoiceName.startsWith('http') || invoiceName.startsWith('https')) {
    url = invoiceName
  } else if (invoiceName.startsWith('//')) {
    url = `https:${invoiceName}`
  }

  return got.get(url).then(async response => {
    const body = await response.body
    const json = JSON.parse(body)
    if (!invoiceName.includes(json.name)) {
      throw new Error('Invalid invoice')
    }
    return json
  })
}

export async function show (ctx: AppContext): Promise<void> {
  const queryParams = ctx.query

  const invoiceName = queryParams.q

  if (!invoiceName) {
    return
  }

  try {
    const invoice = await getInvoice(invoiceName as string)

    ctx.status = 200
    ctx.body = invoice
  } catch (error) {
    ctx.stats = 404
  }
}
