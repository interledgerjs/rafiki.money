import React, { useRef, useState, useEffect } from 'react'
import { NextPage } from "next"
import { UsersService } from '../services/users'
import { Button, TextInput } from '../components'
import { checkUser } from '../utils'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

const Pay = () => {

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
    const response = {
      methodName: 'https://payment-handler-example.firebaseapp.com/pay',
      details: { id: '123456' }
    };
    client.postMessage(response);
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  const onCancel = () => {
    if (!client) return;
    client.postMessage('The payment request is cancelled by user');
    // Chrome will close all windows in the scope of the service worker
    // after the service worker responds to the 'paymentrequest' event.
  }

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        <div className='text-center my-12 mx-auto'>
          <Button onTap={ onCancel } className="mr-4" bgColour="primary" type='text'>CANCEL</Button>
          <Button onTap={ onPay } bgColour="primary" type='text' >PAY</Button>
        </div>
      </div>
    </div>
  )
}

Pay.getInitialProps = async (ctx) => {
  const cookies = parseCookies(ctx)
  if(cookies && cookies.target) {
    destroyCookie(ctx, 'target')
  } else {
    setCookie(ctx, 'target', ctx.req.url, {maxAge: 5 * 60})
  }
  const user = await checkUser(ctx)

  return { user }
}

export default Pay
