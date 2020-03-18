import React, {useState, useEffect} from 'react'
import ky from 'ky-universal'
import { UsersService } from '../services/users'
import { formatCurrency, getCurrencySymbol } from '../utils'
import { ConsentRequest } from '../pages/consent'
import { parse, toSeconds } from 'iso8601-duration';
import humanize from 'humanize-duration'
import Card from './card'
import Logo from './logo'
import Selector from './selector'
import Button from './button'
import { AccountInfo } from 'models'

const FX_API_URL = process.env.FX_API_URL || 'https://min-api.cryptocompare.com'

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

type Mandate = {
  assetCode: string;
  assetScale: number;
  amount: string;
  interval?: string;
  description?: string;
}

type AuthorizationDetails = {
  type: string;
  locations: string[];
  actions: string[];
}

const humanizeInterval = (interval: string): string => {
  return humanize(toSeconds( parse(interval))*1000)
}

const FieldEntry: React.FC<{ description: string, value: string, className: string }> = ({ description, value, className }) => {
  return value ? (
    <div className={className}>
      <div className="overline">{description}</div>
      <div className="headline-6">{value}</div>
    </div>
  ) : null
}

const formatAccounts = (accounts: Partial<AccountInfo>[]): { label: string, value: number }[] => {
  return accounts.map(account => ( { value: account.id, label: `${account.name} - ${getCurrencySymbol(account.assetCode)}${formatCurrency(Number(account.balance), account.assetScale)}` } ))
}

async function getCurrencyConversionFactor(from: string, to: string): Promise<number> {
  const result = await ky(`${FX_API_URL}/data/price?fsym=${from}&tsyms=${to}`).json()
  return result[to.toUpperCase()]
}

const AgreementConsent: React.FC<AgreementConsentProps> = ({consentRequest, challenge}) => {

  const [merchantName, setMerchantName] = useState('')
  const [chosenAccount, setChosenAccount] = useState<Partial<AccountInfo> | undefined>()
  const [forexAmount, setForexAmount] = useState<string | undefined>()
  const [mandate, setMandate] = useState<Mandate>()
  const [handlingConsent, setHandlingConsent] = useState<boolean>(false)
  const users = UsersService()

  useEffect(() => {
    console.log('Consent request ', consentRequest)
    setMandate(consentRequest.mandate)
    setMerchantName(consentRequest.client.client_name || '' )
  }, []);

  useEffect(() => {
    if (mandate && chosenAccount) {
      getCurrencyConversionFactor(mandate.assetCode, chosenAccount.assetCode).then(factor => { 
        const mandateAmount = Number(mandate.amount) * 10**(-mandate.assetScale)
        const result = mandateAmount * factor
        setForexAmount(result.toFixed(chosenAccount.assetScale))
      })
    }
  }, [chosenAccount])

  async function handleAcceptConsent() {
    if (!chosenAccount) {
      alert('Please choose an account')
      return
    }
    try {
      const acceptConsent = await users.handleConsent(challenge, {
        accepts: true,
        accountId: chosenAccount.id,
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

  async function handleRejectConsent() {
    if (!handlingConsent) {
    const rejectConsent = await users.handleConsent(challenge, {
      accepts: false,
      scopes: consentRequest.requestedScopes
    })

    window.location.href = rejectConsent.redirectTo
    }
  }

  return mandate ?
    (
      <div className="flex w-full h-screen">
        <div className="mx-auto w-card">
          <div className="flex justify-center">
            <Logo height={192}/>
          </div>
          <Card>
            <div className="body-2 w-64 mx-auto text-center">
              Authorize <span className="font-bold">{merchantName}</span> to access your Rafiki account
            </div>
            <div className="mt-4 w-full">
              <div className="subtitle-2">
                Mandate
              </div>
              <div className="flex mt-3">
                <div className="w-8">
                  <i className={`material-icons w-5 h-5 text-on-surface-disabled`}>{'info'}</i>
                </div>
                <div className='flex-1 caption'>{merchantName} will be able to debit your account for <span>{formatCurrency(Number(mandate.amount), mandate.assetScale)} {mandate.assetCode.toUpperCase()}</span></div>
              </div>

              <FieldEntry description="amount" value={ getCurrencySymbol(mandate.assetCode) + " " + formatCurrency(Number(mandate.amount), mandate.assetScale) + " " + mandate.assetCode.toUpperCase()} className="mt-3"/>
              <FieldEntry description="interval" value={mandate.interval ? humanizeInterval(mandate.interval) : null} className="mt-3"/>
              <FieldEntry description="description" value={mandate.description} className="mt-3"/>

              <div className="mt-4">
                <Selector options={ consentRequest.accounts ? formatAccounts(consentRequest.accounts) : []} onChange={event => { setChosenAccount(consentRequest.accounts.filter(account => account.id === event.value)[0]) }}/>
              </div>

              {
                forexAmount ? 
                <div className="w-full bg-primary-100 mt-4 px-2 h-8 rounded overline flex items-center">
                  {formatCurrency(Number(mandate.amount), mandate.assetScale)} {mandate.assetCode} &asymp; {forexAmount} {chosenAccount.assetCode}
                </div> : null
              }

              <div className="mt-8 flex justify-end">
                <Button type="text" onClick={handleRejectConsent} disabled={handlingConsent}>CANCEL</Button>
                <div className="w-4"></div>
                <Button type="solid" disabled={handlingConsent} onClick={handleAcceptConsent}>AUTHORIZE</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    ) : null
}

export default AgreementConsent;
