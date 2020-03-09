import React, { useRef, useState, useEffect } from 'react'
import { NextPage } from "next"
import { UsersService } from '../services/users'
import ky from 'ky'
import axios from 'axios'
import { Button, TextInput } from '../components'
import { checkUser } from '../utils'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

const Pay = (props) => {

  let client;

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', e => {
      client = e.source;
      console.log('e source ->',client)
    });
    navigator.serviceWorker.controller.postMessage('payment_app_window_ready');
  })

  const onPay = () => {
    if (!client) return;
    console.log(client)
    const response = {
      methodName: 'http://localhost:3000',
      details: { id: '123456' }
    };
    client.postMessage(response);
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  const onCancel = () => {
    if (!client) return;
    client.postMessage('The payment request is cancelled by user')
    window.close();
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  if (props.invoice) {
    return (
      <div className = 'w-full h-full bg-surface overflow-hidden'>
        <div className='w-full h-screen mx-auto bg-surface flex items-center max-w-sm'>
          <div className="max-w-sm">
            <h2 className={`headline-4 text-on-surface text-center my-8`}>Confirm Payment</h2>
            <table className="table-fixed w-full bg-primary text-surface rounded">
              <tbody>
                <tr className="">
                  <td className="px-4 py-2 w-1/3">Description</td>
                  <td className="px-4 py-2 overflow-x-auto">{props.invoice.description}</td>
                </tr>
                <tr className="">
                  <td className="px-4 py-2">Amount</td>
                  <td className="px-4 py-2 overflow-x-auto">{`${(props.invoice.amount/Math.pow(10, props.invoice.assetScale)).toFixed(props.invoice.assetScale).toString()} ${props.invoice.assetCode}`}</td>
                </tr>
                <tr className="">
                  <td className="px-4 py-2">Receiving wallet</td>
                  <td className="px-4 py-2 break-words">{props.invoice.subject}</td>
                </tr>
              </tbody>
            </table>
            <div className='text-center my-8 mx-auto'>
              <Button onTap={ onCancel } className="mr-4" bgColour="primary" type='text'>CANCEL</Button>
              <Button onTap={ onPay } bgColour="primary" type='text' >PAY</Button>
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
              <Button onTap={ window.close() } className="mr-4" bgColour="primary" type='text'>CANCEL</Button>
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
    const invoice = await axios.get(`http:${query.name}`)
    // const invoiceOptions = await ky(`http:${query.name}`, {method: 'OPTIONS'})
    const props = {
      user,
      invoice: invoice.data,
      // invoiceOptions
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
