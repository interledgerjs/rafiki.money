import { AppContext } from '../app'

const INVOICES_URL = process.env.INVOICES_URL || 'http://localhost:3001/invoices'
const MANDATES_URL = process.env.MANDATES_URL || 'http://localhost:3001/mandates'
const SUPPORTED_ASSETS = process.env.SUPPORTED_ASSETS || JSON.stringify(['USD'])
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL || 'http://localhost:9000/oauth2/auth'
const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:9000/'
const TOKEN_URL = process.env.TOKEN_URL || 'http://localhost:9000/oauth2/token'

export async function show (ctx: AppContext): Promise<void> {
  ctx.body = {
    invoices_endpoint: INVOICES_URL,
    mandates_endpoint: MANDATES_URL,
    assets_supported: JSON.parse(SUPPORTED_ASSETS),
    issuer_endpoint: ISSUER_URL,
    authorization_endpoint: AUTHORIZATION_URL,
    token_endpoint: TOKEN_URL
  }
}
