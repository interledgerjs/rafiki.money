import React, { useRef, useState, useEffect } from 'react'
import ky from 'ky-universal'
import { Button, Selector } from '../components'
import { checkUser, formatCurrency } from '../utils'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { payInvoice } from '../services/pay'
import { NextPage } from 'next'
import useForm from 'react-hook-form'
import { UsersService } from 'services/users'

const METHOD_NAME = process.env.METHOD_NAME || 'https://openpayments.dev/pay'
const usersService = UsersService();

interface Options {
  value: number,
  label: string
}

type Props = {
  user: any,
  accounts: any,
  invoice?: any
}

const Pay: NextPage<Props> = ({accounts, user, invoice}) => {
  const [selectedAccount, setSelectedAccount] = useState<Options>()
  const [client, setClient] = useState<any>()

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', e => {
      setClient(e.source)
      console.log('e source ->',client)
    })
    navigator.serviceWorker.controller.postMessage('payment_app_window_ready')
  })

  const onPay = async () => {
    if (!client) return

    await payInvoice(invoice.name, Number(invoice.amount), selectedAccount.value, user.token).then(async (response) => {
      const body = await response.json()
      client.postMessage({
        methodName: METHOD_NAME,
        details: invoice
      })
    }).catch((error) => {

    })
  }

  const onCancel = () => {
    if (!client) return
    const response = "The payment request is cancelled by user"
    client.postMessage(response)
  }

  if (invoice) {
    return (
      <div className="w-full h-screen flex">
        <div className="max-w-sm w-full mx-auto shadow rounded my-auto px-4 py-4 bg-surface overflow-hidden">
          <div className="my-2">
            <div className="overline text-on-surface-disabled">
              Amount
            </div>
            <div className="headline-6">
              {formatCurrency(Number(invoice.amount), invoice.assetScale)} {invoice.assetCode}
            </div>
          </div>
          <div className="my-2">
            <div className="overline text-on-surface-disabled">
              Description
            </div>
            <div className="headline-6">
              {}
            </div>
          </div>
          <div>
            <Selector
              options={accounts}
              onChange={(e) => setSelectedAccount(e)}
            />
            <div className="-mt-2 mb-6 px-2 py-2 bg-primary-100 rounded overline text-black font-bold">
              ≈ {formatCurrency(Number(invoice.amount), invoice.assetScale)} {invoice.assetCode}
            </div>
            <div className="flex justify-end pt-2 pb-2">
              <Button onClick={onCancel} type="text" buttonType="reset">
                Cancel
              </Button>
              <Button onClick={onPay} disabled={!selectedAccount} type="solid" buttonType="submit" className="ml-4">
                Pay
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className = 'w-full h-full bg-surface overflow-hidden'>
        <div className='w-full h-screen mx-auto bg-surface flex items-center max-w-sm'>
          <div className="max-w-sm">
            <h2 className={`headline-4 text-on-surface text-center my-8`}>Payment Failed</h2>
            <div className='text-center my-8 mx-auto'>
              <Button onClick={ () => {window.close()} } className="mr-4" bgColour="primary" type='text'>CANCEL</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Pay.getInitialProps = async (ctx) => {
  const { query } = ctx
  const cookies = parseCookies(ctx)
  if(cookies && cookies.target) {
    destroyCookie(ctx, 'target')
  } else {
    setCookie(ctx, 'target', ctx.req.url, {maxAge: 5 * 60})
  }
  const user = await checkUser(ctx)
  const accounts = await usersService.getAccounts(user.token, user.id).then(accounts => {
    return accounts.map(account => {
      return {
        value: account.id,
        label: `${account.name} ($${formatCurrency(account.balance,6)})`
      }
    })
  })

  const invoice = await ky(`https:${query.name}`, {method: 'GET'}).json().catch(error => {
    return null
  })

  return {
    user,
    accounts,
    invoice
  }
}

export default Pay
