import { NextPage } from 'next'
import React from 'react'
import Layout from '../src/Layout'
import axios from 'axios'
import getConfig from 'next/config'
import decode from 'jwt-decode'

const dummyToken: token = {
  access_token: "ihrnpToM0qAmsR0pQmkYwRy5Gip2o7RovTOY-a6NlCg.WZia_ZiOHf8l_oJQxueQgh7CA910P502z_txfWcFb6I",
  expires_in: 0,
  id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzpiZTFjMTBmZS0xMGU4LTQ3MzItOTYxZi1kMzU2ZmExMGYzYjgiLCJ0eXAiOiJKV1QifQ.eyJhdF9oYXNoIjoic016OE5vM1VDVU8xVUZpS2JPUlp1QSIsImF1ZCI6WyJyYWZpa2kuc2hvcCJdLCJhdXRoX3RpbWUiOjE1NzEwNjIzNTMsImV4cCI6MTU3MTA2NTk1OCwiaWF0IjoxNTcxMDYyMzU4LCJpbnRlcmxlZGdlciI6eyJhZ3JlZW1lbnQiOnsiYWNjb3VudElkIjo0LCJhbW91bnQiOiIxMjk3IiwiYXNzZXQiOnsiY29kZSI6IlVTRCIsInNjYWxlIjoyfSwiZGVzY3JpcHRpb24iOiJJTFAgRWF0cyBPcmRlciIsImV4cGlyeSI6MTU3MTA2NTk0MjY2OSwiaWQiOiIwNDMyZTNkNS1iOGU3LTRlMWEtYmU3Yy03MDljZmMxMTMyNzMiLCJzY29wZSI6IiRyYWZpa2kubW9uZXkvcC9tYXR0Iiwic3RhcnQiOjE1NzEwNjIzNDI2NjksInVzZXJJZCI6NH19LCJpc3MiOiJodHRwczovL2F1dGgucmFmaWtpLm1vbmV5LyIsImp0aSI6ImIyZmJmMDFmLTI5YjgtNDZjYy05NzFjLWE5MDhmY2Q2MWQ0ZiIsIm5vbmNlIjoiIiwicmF0IjoxNTcxMDYyMzQzLCJzaWQiOiI0MzMzOTBkZS05OTE4LTQ2NTktYjYwOC01MzZjMmUyMGMyZmQiLCJzdWIiOiI0In0.dBqsbFaCIbzuLiUGI4l7NVl7iXT_fT5g6q9vUkkwluVdKvCfe_OHp9d67bTxZdVQSK8qDGRgHbDTipUsh95jhox0S1N1UsoAPO5mGf5q0IZzj0i1MY-mP6FlIgyiix6WlL3fD6NmBQ0_1f7oQAbTrbI7KdrmtbxIvuKP7CLIe8hALwKTlnl-k-q4epSDPLGOMXjrTWS47DPOAKA-47375azEttpwGbp3iEfuCQ2ugUr-G8ky9zKkI-YR6NFXsEQPdrGOAJTLOr1pJuW9dzd2054JIoePNx1jItUQUdx51fC2BCOauvXcCEg9dks3bsS_JU1hDqwfZCYT_AU7tFHvsWZ8I9TwH_5lib3N7aqXxZGngL0MilyW_ARhz3R8GogldMvj7fXmNaOCmXuVupKWOgZNh5rOsUTz2-wfpd98h5ccneg-yKtZ0jIcedDrF5NMaAgROS6EICh2dZJNGDRBPGbU_5f-0dT9E1R1fNrb5C6N_7dq3wcZ7tpbQ_KQU2VJGFm3g7v3tlhp6Ll9TSGqFuu7gHbgpjFeZ1WroD1zn34qFgTFhL7gcwxXFMaE3A8HUPvrzQNs3tiVQlRMWaajb5r4b45fQUbW-k9AquOhHCJnP61YdadE9-IhUSscDxrZQV00zmybwxLapOJUMkrhOBmGcUtkDdSRxFWyyT0WzcE",
  refresh_token: "Wh6v3MSvjAYz7bt6miLCoTJEccOKd2l_Zccc6dt1iMo.FqUVI3yjm5_-GrrAKMTGC6lUQV-hnvIyhahArl2uaks",
  scope: "openid offline mandates.0432e3d5-b8e7-4e1a-be7c-709cfc113273\n",
  token_type: "bearer"
}

type token = {
    access_token: string,
    expires_in: number,
    id_token: string,
    refresh_token: string,
    scope: string,
    token_type: string
}

type Props = {
  error?: string,
  token?: token
}

const renderItem = (label: string, value: string) => {
  return (
    <div className="flex flex-row mb-4">
      <div className="whitespace-no-wrap w-1/3 text-grey-dark">
        { label }
      </div>
      <div className="flex-1 font-medium" style={{ wordBreak: 'break-all'}}>
        { value }
      </div>
    </div>
  )
}

const goToPaymentInitiation = (token: token) => {
  const idToken: any = decode(token.id_token)

  const win = window.open(`/stream?token=${token.access_token}&amount=${idToken.interledger.agreement.amount}`, '_blank');
  if(win) {
    win.focus();
  }
}

const Page: NextPage<Props> = ({token, error}) => {
  return token ? (
    <Layout title="Callback">
      <div className="flex flex-col justify-center mt-12">
        <div className="mx-auto mb-8 max-w-md font-mono text-grey-darkest">
          The following is the example of what the Merchant's backend would receive after redeeming the access_code to the
          wallets oauth server. Using the access token, the merchant would be able to PULL the funds out of the wallet
          via delegated access encompassed by the created mandate.
        </div>
        <div className="mx-auto mb-8">
          <button
            onClick={() => goToPaymentInitiation(token)}
            className="w-full h-10 shadow bg-grey-dark hover:bg-grey focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
            type="button">
            Initiate Payment
          </button>
        </div>
        <div className="mx-auto flex flex-col justify-center align-center max-w-md bg-white p-4 rounded shadow-lg">
          {renderItem('Access Token', token.access_token)}
          {renderItem('Expires', token.expires_in.toString())}
          {renderItem('Id Token', token.id_token)}
          {renderItem('Refresh Token', token.refresh_token)}
          {renderItem('Scope', token.scope)}
          {renderItem('Token Type', token.token_type)}
        </div>
      </div>
    </Layout>
  ) :
    <Layout title="Callback">
      <div className="w-full h-full flex justify-center">
        <div className="my-auto flex flex-col justify-center align-center bg-white p-4 rounded shadow-lg">
          { error }
        </div>
      </div>
    </Layout>
}

Page.getInitialProps = async ({ req, query: { code, callbackUrl, clientId } }) => {
  const { publicRuntimeConfig } = getConfig()
  const { CLIENT_ID, TOKEN_URL, CALLBACK_URL } = publicRuntimeConfig
  try {
    const params = new URLSearchParams()
    params.set('client_id', clientId ? clientId : CLIENT_ID)
    params.set('grant_type', "authorization_code")
    params.set('code', code as string)
    params.set('redirect_uri', callbackUrl ? callbackUrl : CALLBACK_URL)

    console.log('Parsed code out of url response: ', code)
    const { data } = await axios.post(TOKEN_URL, params, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    console.log('Exchanged code for an access token:', data)

    return {
      token: data
    }
  } catch (error) {
    console.log('Error getting token using code', error)
    return {
      error: 'Failed to retrieve token'
    }
  }
}

export default Page
