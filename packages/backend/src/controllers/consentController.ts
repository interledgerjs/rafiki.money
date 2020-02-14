import axios from 'axios'
import { Config, Joi } from 'koa-joi-router'
import { AppContext } from '../app'
import { hydra } from '../../src/services/hydra'
import { accounts } from '../services/accounts'
import { Context } from 'koa'
import { User } from '../models/user'

const INTENTS_URL = process.env.INTENTS_URL || 'http://localhost:3001/intents'
const MANDATES_URL = process.env.MANDATES_URL || 'http://localhost:3001/mandates'
const BASE_PAYMENT_POINTER_URL = process.env.BASE_PAYMENT_POINTER_URL || '$rafiki.money/p'

export function getAgreementUrlFromScopes (scopes: string[]): string | undefined {
  const agreementScopes = scopes.filter(scope => {
    return scope.startsWith('intents.') || scope.startsWith('mandates.')
  })

  if (agreementScopes.length > 1) {
    throw new Error('Can only ask for single agreement scope at a time')
  }

  if (agreementScopes.length === 0) {
    return undefined
  }

  return agreementScopes[0].startsWith('intents.')
    ? INTENTS_URL + '/' + agreementScopes[0].slice(8) : MANDATES_URL + '/' + agreementScopes[0].slice(9)
}

async function getUsersPaymentPointer (userId: string): Promise<string> {
  const user = await User.query().where('id', userId).first()
  if (!user) {
    throw new Error('No user found to create mandate scope. userId=' + userId)
  }

  return `${BASE_PAYMENT_POINTER_URL}/${user.username}`
}

export async function generateAccessAndIdTokenInfo (scopes: string[], userId: string, assert: Context['assert'], accountId?: number): Promise<{ accessTokenInfo: { [k: string]: any }; idTokenInfo: { [k: string]: any } }> {
  const agreementUrl = getAgreementUrlFromScopes(scopes)
  if (!agreementUrl) {
    return {
      accessTokenInfo: {},
      idTokenInfo: {}
    }
  }

  assert(accountId, 400, 'accountId is required when accepting consent for intent/mandate')

  const agreement = await axios.get(agreementUrl).then(resp => resp.data)
  const usersPaymentPointer = await getUsersPaymentPointer(userId)
  if (agreement.scope) {
    assert(agreement.scope === usersPaymentPointer, 401, 'You are not allowed to give consent to this agreement.')
  }

  const updateScopeData = { accountId, userId }
  if (agreementUrl.match(/mandate/)) {
    updateScopeData['scope'] = usersPaymentPointer
  }
  const updatedAgreement = await axios.patch(agreementUrl, updateScopeData).then(resp => resp.data)

  return {
    accessTokenInfo: {
      interledger: {
        agreement: updatedAgreement
      }
    },
    idTokenInfo: {
      interledger: {
        agreement: updatedAgreement
      }
    }
  }
}

export async function show (ctx: AppContext): Promise<void> {
  const challenge = ctx.request.query['consent_challenge']
  ctx.logger.debug('Getting consent request', { challenge })

  const consentRequest = await hydra.getConsentRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in login request')
    throw error
  })
  ctx.logger.debug('Got hydra consent request', { consentRequest })

  if (consentRequest['skip'] || consentRequest['client'].client_id === 'frontend-client' || consentRequest['client'].client_id === 'wallet-gui-service') {
    const acceptConsent = await hydra.acceptConsentRequest(challenge, {
      remember: true,
      remember_for: 0,
      grant_scope: consentRequest['requested_scope'],
      grant_access_token_audience: consentRequest['requested_access_token_audience'],
      session: {
        // // This data will be available when introspecting the token. Try to avoid sensitive information here,
        // // unless you limit who can introspect tokens.
        // access_token: accessTokenInfo,
        //
        // // This data will be available in the ID token.
        // id_token: idTokenInfo
      }
    }).catch(error => {
      ctx.logger.error('Error with hydra accepting consent', { error })
      throw error
    })

    ctx.body = {
      redirectTo: acceptConsent['redirect_to']
    }
    return
  }

  const grantScopes: string[] = Array.from(consentRequest['requested_scope'])
  const agreementUrl = getAgreementUrlFromScopes(grantScopes)
  ctx.logger.debug('grantScopes and agreementUrl', { grantScopes, agreementUrl })

  let accountList
  if (agreementUrl) {
    const token = await ctx.tokenService.getAccessToken()
    ctx.logger.debug('access token', { token })

    accountList = await accounts.getUserAccounts(consentRequest['subject'], token)
    ctx.logger.debug('Got account list', { accountList })
  }

  ctx.body = {
    requestedScopes: consentRequest['requested_scope'],
    client: consentRequest['client'], // TODO we should probably not leak all this data to the frontend
    user: consentRequest['subject'],
    accounts: accountList,
    agreementUrl
  }
}

export async function store (ctx: AppContext): Promise<void> {
  const challenge = ctx.request.query['consent_challenge']
  const { accepts, scopes, accountId } = ctx.request.body
  ctx.logger.debug('Post consent request', { body: ctx.request.body, challenge })

  if (!accepts) {
    const rejectConsent = await hydra.rejectConsentRequest(challenge, {
      error: 'access_denied',
      error_description: 'The resource owner denied the request'
    }).catch(error => {
      ctx.logger.error('error rejecting hydra consent')
      throw error
    })

    ctx.body = {
      redirectTo: rejectConsent['redirect_to']
    }
    return
  }

  const consentRequest = await hydra.getConsentRequest(challenge)
  ctx.logger.debug('consent request from hydra', { consentRequest })

  const { accessTokenInfo, idTokenInfo } = await generateAccessAndIdTokenInfo(scopes, consentRequest['subject'], ctx.assert, accountId)
  ctx.logger.debug('Making accept request to hydra', { accessTokenInfo, idTokenInfo })
  const acceptConsent = await hydra.acceptConsentRequest(challenge, {
    remember: true,
    remember_for: 0,
    grant_scope: scopes,
    grant_access_token_audience: consentRequest['requested_access_token_audience'],
    session: {
      // This data will be available when introspecting the token. Try to avoid sensitive information here,
      // unless you limit who can introspect tokens.
      access_token: accessTokenInfo,

      // This data will be available in the ID token.
      id_token: idTokenInfo
    }
  }).catch(error => {
    ctx.logger.error('Error with hydra accepting consent', { error })
    throw error
  })

  ctx.body = {
    redirectTo: acceptConsent['redirect_to']
  }
}

export function getValidation (): Config {
  return {
    validate: {
      query: {
        consent_challenge: Joi.string().required().error(new Error('consent_challenge is required.'))
      }
    }
  }
}

export function storeValidation (): Config {
  return {
    validate: {
      type: 'json',
      body: {
        accepts: Joi.bool().required(),
        scopes: Joi.array().items(Joi.string()).required(),
        accountId: Joi.number().integer().greater(0).optional()
      },
      query: {
        consent_challenge: Joi.string().required().error(new Error('consent_challenge is required.'))
      }
    }
  }
}
