import React, {useEffect} from 'react'
import {RouteComponentProps} from "react-router-dom"
import axios from 'axios'

const AGREEMENT_URL = 'https://rafiki.money/api/mandates'
const MANDATES_URL = 'https://rafiki.money/api/mandates'
const INTENTS_URL = 'https://rafiki.money/api/intents'
const OAUTH_ENDPOINT = 'https://auth.rafiki.money/oauth2/auth'

export type PaymentRequest = {
  paymentRequest?: {
    id: string,
    origin: string,
    topOrigin: string,
    instrumentKey: string,
    total: string
  },
  mandate?: {
    amount: string,
    asset: {
      code: string,
      scale: number
    },
    interval?: string,
    expiry?: number,
    description?: string
  },
  merchantInfo?: {
    clientId: string
  }
}

export type PaymentResponse = {
  code: string,
  state: string,
  scopes: string
}

function parsePaymentHandlerRequestData (queryString: string): PaymentRequest {
  const params = new URLSearchParams(queryString)
  const encodedData = params.get('request')
  return encodedData ? JSON.parse(decodeURI(encodedData)) : null
}

function parsePaymentHandlerResponseData (queryString: string) {
  const params = new URLSearchParams(queryString)
  const code = params.get('code') || ''
  const state = params.get('state') || ''
  const scopes = params.get('scope') || ''
  return code && state ? {
    code,
    state,
    scopes
  } : null
}

function getAgreementsUrlFromScope (scopes: string) {
  const parts = scopes.split(' ')
  const agreementScopes = parts.filter(scope => {
    return scope.startsWith('intents.') || scope.startsWith('mandates.')
  })

  if (agreementScopes.length > 1) {
    throw new Error('Can only ask for single agreement scope at a time')
  }

  if (agreementScopes.length === 0) {
    throw new Error('No agreement scope found. Scopes: ' + scopes)
  }

  return agreementScopes[0].startsWith('intents.')
    ? INTENTS_URL + '/' + agreementScopes[0].slice(8) : MANDATES_URL + '/' + agreementScopes[0].slice(9)
}

async function handlePaymentRequest(paymentRequest: PaymentRequest) {
  const PAYMENT_CALLBACK_URL = process.env.REACT_APP_PAYMENT_CALLBACK_URL || 'https://rafiki.money/payment-handler'
  console.log('Handling payment request', paymentRequest)
  const mandate = await axios.post(AGREEMENT_URL, paymentRequest.mandate).then(resp => resp.data)
  const CLIENT_ID = paymentRequest.merchantInfo ? paymentRequest.merchantInfo.clientId : ''
  const authUrl = OAUTH_ENDPOINT

  const authQuery = `?client_id=${CLIENT_ID}&response_type=code&scope=openid%20offline%20mandates.${mandate.id}&state=payment-handler&redirect_uri=${PAYMENT_CALLBACK_URL}`
  window.location.href = authUrl + authQuery
}

async function handlePaymentResponse(response: PaymentResponse) {
  console.log('Handling payment response', response)
  const TOKEN_ENDPOINT = process.env.REACT_APP_TOKEN_ENDPOINT
  const ILP_ENDPOINT = process.env.REACT_APP_ILP_ENDPOINT

  const mandateUrl = getAgreementsUrlFromScope(response.scopes)
  console.log('Fetching mandate from ', mandateUrl)
  const mandate = await axios.get(mandateUrl).then(resp => resp.data)

  const { controller } = navigator.serviceWorker
  if(controller) {
    controller.postMessage({
      methodName: 'interledger',
      details: {
        code: response.code,
        token_endpoint: TOKEN_ENDPOINT,
        ilp_endpoint: ILP_ENDPOINT,
        mandate: mandate,
      },
    })
  }
}

const Checkout: React.FC<RouteComponentProps> = ({location}: RouteComponentProps) => {

  useEffect(() => {
    console.log('parsing payment handler request/response from url...')
    const paymentHandlerData = parsePaymentHandlerRequestData(location.search)
    const handlerResponseData = parsePaymentHandlerResponseData(location.search)

    console.log('payment handler request', paymentHandlerData)
    console.log('payment handler respone', handlerResponseData)
    if(paymentHandlerData) {
      handlePaymentRequest(paymentHandlerData)
    }
    if(handlerResponseData) {
      handlePaymentResponse(handlerResponseData)
    }

  }, [])


 return (
    <div className="flex-1">
      <div className="max-w-sm rounded overflow-hidden shadow-lg mx-auto mt-1 mx-auto flex flex-col" style={{height: '24rem'}}>
        <div className="mx-auto my-4 flex flex-col">
          <div className="mt-1">
            Loading
          </div>
        </div>
    </div>
    </div>
  );
}

export default Checkout;
