import React, {useState, useEffect} from 'react'
import ky from 'ky-universal'
import { UsersService } from '../services/users'
import { formatCurrency } from '../utils'
import { ConsentRequest } from '../pages/consent'
import { parse, toSeconds } from 'iso8601-duration';
import humanize from 'humanize-duration'

type AgreementConsentProps = {
  consentRequest: ConsentRequest
  challenge: string
}

type Agreement = {
  amount: string,
  scope: string
  start: number
  asset: {
    code: string
    scale: number
  },
  description?: string
  expiry?: number
  interval?: string
  cycles?: number
}

const humanizeInterval = (interval: string): string => {
  return humanize(toSeconds( parse(interval))*1000)
}

const renderOnceOffPayment = (agreement: Agreement) => {
  return (
      <div>
          <div className="mb-3">
              Debit your account for a SINGLE payment of
          </div>
          <div className="w-full flex my-1">
              <div className="w-1/4">
                  Amount
              </div>
              <div className="flex">
                {agreement.asset.code} {formatCurrency(parseInt(agreement.amount), agreement.asset.scale)}
              </div>
          </div>
          <div className="w-full flex my-1">
              <div className="w-1/4">
                  Description
              </div>
              <div className="flex">
                {agreement.description}
              </div>
          </div>
      </div>
  )
}

const renderSubscriptionPayment = (agreement: Agreement) => {
  if(agreement.interval) {
    return (
      <div>
        <div className="mb-3">
          Debit your account for a RECURRING payment
        </div>
        <div className="w-full flex my-1">
          <div className="w-1/4">
            Amount
          </div>
          <div className="flex">
            {agreement.asset.code} {formatCurrency(parseInt(agreement.amount), agreement.asset.scale)}
          </div>
        </div>
        <div className="w-full flex my-1">
          <div className="w-1/4">
            Frequency
          </div>
          <div className="flex">
            {humanizeInterval((agreement.interval))}
          </div>
        </div>
        <div className="w-full flex my-1">
          <div className="w-1/4">
            Description
          </div>
          <div className="flex">
            {agreement.description}
          </div>
        </div>
      </div>
    )
  }
}

const AgreementConsent: React.FC<AgreementConsentProps> = ({consentRequest, challenge}) => {

  const [merchantName, setMerchantName] = useState('')
  const [merchantLogoSrc, setMerchantLogoSrc] = useState('')
  const [chosenAccountId, setChosenAccountId] = useState(0)
  const [agreement, setAgreement] = useState<Agreement>()
  const users = UsersService()

  async function getAgreementAndMerchantDetails() {
    console.log('Fetching agreement from ', consentRequest.agreementUrl)
    await ky.get(consentRequest.agreementUrl!).then(async resp => {
      const agreement = await resp.json()
      setAgreement(agreement)
    })

    setMerchantLogoSrc(consentRequest.client.logo_uri || '')
    setMerchantName(consentRequest.client.client_name || '' )
  }

  useEffect(() => {
    getAgreementAndMerchantDetails()
  }, []);


  async function handleAcceptConsent() {
    if (chosenAccountId === 0) {
      alert('Please choose an account')
      return
    }
    try {
      const acceptConsent = await users.handleConsent(challenge, {
        accepts: true,
        accountId: chosenAccountId,
        scopes: consentRequest.requestedScopes
      })
      window.location.href = acceptConsent.redirectTo
    } catch (error) {
      if (error.response.status === 401) {
        const rejectConsent = await users.handleConsent(challenge, {
          accepts: false,
          scopes: consentRequest.requestedScopes
        })
        alert(error.response.data)
        window.location.href = rejectConsent.redirectTo
        return
      }
      console.log('error accepting consent', error.response)
      alert('An error occurred whilst trying to authorize the agreement.')
    }
  }

  return agreement ?
    (
      <div className="w-full max-w-sm mx-auto mt-16 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className='w-full flex justify-center align-center mb-4'>
          <img src={merchantLogoSrc} className='w-12 h-12 text-center' alt="Merchant Logo"/>
        </div>
        <div className="text-center my-4">
          Authorize <strong className="text-gray-800 font-bold whitespace-no-wrap">{merchantName}</strong> to access your ILP Wallet Account
        </div>
        <div className="text-gray-600 font-semibold text-md mb-2">
          Permissions
        </div>
        <div>
          {
            agreement.interval ? renderSubscriptionPayment(agreement) : renderOnceOffPayment(agreement)
          }
        </div>
        <div className="text-gray-600 font-semibold text-md mb-2 mt-4">
          Wallet
        </div>
        <div className='inline-block relative w-full'>
          <select
            className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-state" onChange={e => setChosenAccountId(Number(e.currentTarget.value))}>
            <option value={0} key={`default`}>Select account</option>
            {consentRequest.accounts!.map(account => <option value={account.id}
                                                             key={`account_${account.id}`}>{account.name}</option>)}
          </select>
          <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-gray-800">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <div onClick={handleAcceptConsent}
               className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded text-center">
            Authorize
          </div>
        </div>
      </div>
    ) : null
}

export default AgreementConsent;
