import React, { useRef, useState, useEffect } from 'react'
import { NextPage } from "next"
import { UsersService } from '../services/users'
import ky from 'ky-universal'
import { Button } from '../components'
import { checkUser } from '../utils'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

const METHOD_NAME = process.env.METHOD_NAME || 'http://localhost:3000/'

const Pay = (props) => {

  let client

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', e => {
      client = e.source
      console.log('e source ->',client)
    })
    navigator.serviceWorker.controller.postMessage('payment_app_window_ready')
  })

  const onPay = () => {
    if (!client) return
    console.log(client)
    const response = {
      methodName: METHOD_NAME,
      details: props.invoice
    }
    client.postMessage(response)
  }

  const onCancel = () => {
    if (!client) return
    const response = "The payment request is cancelled by user"
    client.postMessage(response)
  }

  if (props.invoice) {
    return (
      <div className = 'w-full h-full bg-surface overflow-hidden'>
        <div className='w-full h-screen mx-auto bg-surface flex items-center max-w-sm'>
          <div className="max-w-sm">
            <p className="headline-4 text-on-surface text-center my-8">Confirm Payment</p>
            <p className="body-1 text-on-surface text-left mt-8 mb-4">
              <span className="font-medium">{`${(props.invoice.amount/Math.pow(10, props.invoice.assetScale)).toFixed(props.invoice.assetScale).toString()} ${props.invoice.assetCode}`}</span>
              &nbsp;is going to be paid for&nbsp; 
              <span className="font-medium">{props.invoice.description}</span>
              &nbsp;to:
            </p>
            <p className="body-1 font-medium mt-4 mb-8">{props.invoice.subject}</p>
            <div className='text-right my-8 mx-auto'>
              <Button onClick={ onCancel } className="mr-4" bgColour="primary" type='text'>CANCEL</Button>
              <Button onClick={ onPay } bgColour="primary" type='solid' >PAY</Button>
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
  const cookies = parseCookies(ctx)
  if(cookies && cookies.target) {
    destroyCookie(ctx, 'target')
  } else {
    setCookie(ctx, 'target', ctx.req.url, {maxAge: 5 * 60})
  }
  const user = await checkUser(ctx)
  const { query } = ctx

  try {
    const invoice = await ky(`http:${query.name}`, {method: 'GET'}).json()
    console.log('the invoice: ',invoice)
    const props = {
      user,
      invoice: invoice,
    }

    return (props)
  } catch (error) {
    const props = {
      user
    }
    return (props)
  }
}

export default Pay
