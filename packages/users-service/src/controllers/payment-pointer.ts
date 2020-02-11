import { AppContext } from '../app'
import { User } from '../models/user'
import { generatePskEncryptionKey, generateSharedSecretFromToken, generateToken } from 'ilp-protocol-stream/src/crypto'
import { randomBytes } from 'crypto'

const INTENTS_URL = process.env.INTENTS_URL || 'http://localhost:3001/intents'
const MANDATES_URL = process.env.MANDATES_URL || 'http://localhost:3001/mandates'
const SUPPORTED_ASSETS = process.env.SUPPORTED_ASSETS || JSON.stringify(['USD'])
const AUTHORIZATION_URL = process.env.AUTHORIZATION_URL || 'http://localhost:9000/oauth2/auth'
const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:9000/'
const TOKEN_URL = process.env.TOKEN_URL || 'http://localhost:9000/oauth2/token'

const STREAM_SERVER_SECRET = process.env.STREAM_SERVER_SECRET ? Buffer.from(process.env.STREAM_SERVER_SECRET, 'hex') : randomBytes(32)
const ILP_STREAM_SUBADDRESS = process.env.ILP_STREAM_SUBADDRESS || 'test.wallet'

export type OAuthServerMetaData = {
  // Ilp extension to meta data
  payment_intents_endpoint: string;
  payment_mandates_endpoint: string;
  payment_assets_supported: string[];
  default_account_id: string;
  // Subset of current meta data specified in RFC8414
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  response_types_supported: string[];
  jwks_uri?: string;
  registration_endpoint?: string;
  scopes_supported?: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
  service_documentation?: string;
  token_endpoint_auth_signing_alg_values_supported?: string[];
  ui_locales_supported?: string;
  op_policy_uri?: string;
  op_tos_uri?: string;
}

const base64url = (buffer: Buffer) => {
  return buffer.toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export async function show (ctx: AppContext): Promise<void> {
  ctx.logger.debug('Payment pointer request', { path: ctx.request.path })
  const username = ctx.params.username
  const user = await User.query().where('username', username).first()
  ctx.assert(user, 404, 'No user found.')

  if (ctx.get('Accept').indexOf('application/spsp4+json') !== -1) {
    // Determine the payment pointer used and find the account its correlated with
    const token = base64url(generateToken())
    const sharedSecret = generateSharedSecretFromToken(STREAM_SERVER_SECRET, Buffer.from(token, 'ascii'))

    if (user && !user.defaultAccountId) {
      ctx.status = 404
      return
    }

    const destinationAccount = `${ILP_STREAM_SUBADDRESS}.${user!.defaultAccountId}.${token}`

    ctx.body = {
      destination_account: destinationAccount,
      shared_secret: sharedSecret.toString('base64')
    }
    ctx.set('Content-Type', 'application/spsp4+json')
    ctx.set('Access-Control-Allow-Origin', '*')
  } else {
    ctx.body = {
      payment_intents_endpoint: INTENTS_URL,
      payment_mandates_endpoint: MANDATES_URL,
      payment_assets_supported: JSON.parse(SUPPORTED_ASSETS),
      issuer_endpoint: ISSUER_URL,
      authorization_endpoint: AUTHORIZATION_URL,
      token_endpoint: TOKEN_URL
    }
  }
}
