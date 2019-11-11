import React, { useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import queryString from 'query-string'
import { UsersService } from '../services/users'
import AgreementConsent from './agreements/consent'
import NormalConsent from '../components/normal-consent'
type LoginProps = {
  authenticate: (token: string) => void
} & RouteComponentProps

export type ConsentRequest = {
  accounts?: { id: number, name: string }[],
  client: {
    client_id: string,
    redirect_uris: string[],
    logo_uri?: string,
    client_name?: string
  },
  requestedScopes: string[],
  agreementUrl?: string,
  redirectTo?: string
}

const dummyConsent: ConsentRequest = {
  client: {
    client_id: 'Test',
    redirect_uris: [],
    client_name: 'Merchant'
  },
  requestedScopes: [
    'intents', 'offline', 'openid'
  ]
}

const Consent: React.FC<LoginProps> = (props) => {

  const [consentRequest, setConsentRequest] = useState<ConsentRequest>()
  const params = queryString.parse(props.location.search)
  const consentChallenge = params.consent_challenge
  const users = UsersService()

  async function getConsent() {
    console.log('Fetching consent request from users service...')
    const consentRequest: ConsentRequest = await users.getConsent(consentChallenge as string)
    console.log('consent request: ', consentRequest)
    if (consentRequest.redirectTo) {
      window.location.href = consentRequest.redirectTo
    } else {
      setConsentRequest(consentRequest)
    }
  }

  useEffect(() => {
    getConsent()
  }, []);

  return consentRequest ?
    consentRequest.agreementUrl ?
      <AgreementConsent challenge={consentChallenge as string} consentRequest={consentRequest} {...props}/> :
      <NormalConsent challenge={consentChallenge as string} consentRequest={consentRequest} {...props} /> : null
}

export default Consent;
