import React from 'react'
import { NextPage } from "next"

import { UsersService } from '../services/users'

import { NormalConsent, AgreementConsent } from '../components'

const usersService = UsersService()

type Props = {
  consentChallenge: string
  consent: ConsentRequest
}

export type ConsentRequest = {
  accounts?: { id: number, name: string }[],
  client: {
    client_id: string,
    redirect_uris: string[],
    logo_uri?: string,
    client_name?: string
  },
  requestedScopes: string[],
  mandate?: {
    id: string,
    assetCode: string
    assetScale: number
    amount: string
  },
  redirectTo?: string
}

const dummyMandateConsent: ConsentRequest = {
  client: {
    client_id: 'Test',
    redirect_uris: [],
    client_name: 'Merchant'
  },
  mandate: {
    id: '123',
    assetCode: 'EUR',
    assetScale: 6,
    amount: '20000000'
  },
  requestedScopes: [
    'offline',
  ],
  accounts: [
    {
      id: 1, name: 'Main Account',
    },
    {
      id: 2, name: 'Savings Account',
    }
  ]
}

const Consent: NextPage<Props> = ({consentChallenge, consent}) => {

  const handleConsent = async () => {
    try {
      const acceptConsent = await usersService.handleConsent(consentChallenge, {
        accepts: true,
        scopes: consent.requestedScopes
      })
      window.location.href = acceptConsent.redirectTo
    } catch (error) {
      if (error.response.status === 401) {
        const rejectConsent = await usersService.handleConsent(consentChallenge, {
          accepts: false,
          scopes: consent.requestedScopes
        })
        alert(error.response.data)
        window.location.href = rejectConsent.redirectTo
        return
      }
      console.log('error accepting consent', error.response)
      alert('An error occurred whilst trying to authorize the agreement.')
    }
  }

  return consent ?
    consent.mandate ?
      <AgreementConsent challenge={consentChallenge} consentRequest={consent} /> :
      <NormalConsent consentRequest={consent}  acceptConsent={handleConsent.bind(this)} /> : null
}

Consent.getInitialProps = async ({query, res}) => {
  const { consent_challenge } = query

  return {
    consentChallenge: consent_challenge.toString(),
    consent: dummyMandateConsent
  }

  if(!consent_challenge) {
    res.writeHead(302, {
      Location: '/'
    })
    res.end()
  }

  // Check consentChallenge to see if it can be skipped.
  const consent = await usersService.getConsent(consent_challenge.toString()).then(resp => {

    if(resp.redirectTo) {
      res.writeHead(302, {
        Location: resp.redirectTo
      })
      res.end()
    }
    return resp
  }).catch(error => {
    console.log(error)
  })

  return {
    consentChallenge: consent_challenge.toString(),
    consent
  }
}

export default Consent
