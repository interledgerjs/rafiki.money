import { AppContext } from '../app'
import { hydra } from '../../src/services/hydra'
import { Mandate } from '../models/mandate'
import { Account } from '../models/account'

export async function getMandateFromAuthorizationDetails (authorizationDetails: Array<AuthorizationDetail>): Promise<Mandate | undefined> {
  const mandates = authorizationDetails.filter(item => {
    return item.type === 'open_payments_mandate'
  })

  if (mandates.length === 0) {
    return undefined
  }

  const mandateRequest = mandates[0]
  const location = mandateRequest.locations[0]
  const mandateId = location.substring(location.lastIndexOf('/') + 1)

  return Mandate.query().findById(mandateId)
}

export async function show (ctx: AppContext): Promise<void> {
  const challenge = ctx.request.query['consent_challenge']
  ctx.logger.debug('Getting consent request', { challenge })

  const consentRequest = await hydra.getConsentRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in login request')
    throw error
  })

  const requestUrl = consentRequest['request_url']
  const url = new URL(requestUrl)
  const authorizationDetailsParams = url.searchParams.get('authorization_details')
  const authorizationDetails = authorizationDetailsParams ? JSON.parse(authorizationDetailsParams) : null

  ctx.logger.debug('Got hydra consent request', { consentRequest })

  if (consentRequest['skip'] || consentRequest['client'].client_id === 'frontend-client' || consentRequest['client'].client_id === 'wallet-gui-service') {
    const acceptConsent = await hydra.acceptConsentRequest(challenge, {
      remember: true,
      remember_for: 0,
      grant_scope: consentRequest['requested_scope'],
      grant_access_token_audience: consentRequest['requested_access_token_audience'],
      session: {
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

  const mandate = await (authorizationDetails ? getMandateFromAuthorizationDetails(authorizationDetails) : null)

  if (mandate) {
    const accountList = await Account.query().where('userId', consentRequest['subject'])

    ctx.body = {
      requestedScopes: consentRequest['requested_scope'],
      client: consentRequest['client'], // TODO we should probably not leak all this data to the frontend
      user: consentRequest['subject'],
      accounts: accountList,
      mandate: mandate
    }
  } else {
    ctx.body = {
      requestedScopes: consentRequest['requested_scope'],
      client: consentRequest['client'], // TODO we should probably not leak all this data to the frontend
      user: consentRequest['subject']
    }
  }
}

export async function store (ctx: AppContext): Promise<void> {
  const challenge = ctx.request.query['consent_challenge']
  const { accepts, scopes, accountId } = ctx.request.body
  ctx.logger.debug('Post consent request', { body: ctx.request.body, challenge })

  // User rejected the consent
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

  const consentRequest = await hydra.getConsentRequest(challenge).catch(error => {
    ctx.logger.error(error, 'error in login request')
    throw error
  })

  const requestUrl = consentRequest['request_url']
  const url = new URL(requestUrl)
  const authorizationDetailsParams = url.searchParams.get('authorization_details')
  const authorizationDetails = authorizationDetailsParams ? JSON.parse(authorizationDetailsParams) : null

  const mandate = await (authorizationDetails ? getMandateFromAuthorizationDetails(authorizationDetails) : null)

  if (mandate) {
    const account = await Account.query().findById(accountId)

    if (account.userId.toString() !== consentRequest['subject']) {
      ctx.logger.error('User tried to associate an account not theirs to a mandate')
      throw Error('User tried to associate an account not theirs to a mandate')
    }

    await Mandate.query().where('id', mandate.id).update({
      accountId
    })
  }

  const acceptConsent = await hydra.acceptConsentRequest(challenge, {
    remember: true,
    remember_for: 0,
    grant_scope: scopes,
    grant_access_token_audience: consentRequest['requested_access_token_audience'],
    session: {
      // This data will be available when introspecting the token. Try to avoid sensitive information here,
      // unless you limit who can introspect tokens.
      access_token: authorizationDetails ? {
        authorization_details: authorizationDetails
      } : {},

      // This data will be available in the ID token.
      id_token: authorizationDetails ? {
        authorization_details: authorizationDetails
      } : {}
    }
  }).catch(error => {
    ctx.logger.error('Error with hydra accepting consent', { error })
    throw error
  })

  ctx.body = {
    redirectTo: acceptConsent['redirect_to']
  }
}
