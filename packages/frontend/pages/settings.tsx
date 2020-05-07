/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { Card, Content, Navigation, Button, Selector, ToggleSwitch } from '../components'
import { checkUser } from '../utils'
import Overview from './overview'
import Router from 'next/router'

interface Options {
  value: number
  label: string
}

interface Props {
  user: any
}

const Settings: NextPage<Props> = ({ user }) => {
  const [swInstalled, setSwInstalled] = useState(false)
  const [swSupported, setSwSupported] = useState(true)

  const addInstruments = registration => {
    registration.paymentManager.userHint = 'Registration user hint'
    return await Promise.all([
      registration.paymentManager.instruments.set('Rafiki Money', {
        name: 'Rafiki Money',
        method: 'https://openpayments.dev/pay',
      }),
    ])
  }

  const installSw = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) {
        // @ts-ignore
        if (!registration.paymentManager) {
          // Payment app capability not available, unregister right away.
          registration.unregister().then(success => {})
          // showBobPayError('Payment app capability not present. Enable flags?')
          setSwSupported(false)
          return
        }

        addInstruments(registration).then(function () {
          setSwInstalled(true)
        })
      })
      .catch(error => {
        console.error(error)
        setSwSupported(false)
      })
  }

  const unregisterPaymentAppServiceWorker = () => {
    navigator.serviceWorker.getRegistration('/sw.js').then(function (registration) {
      if (registration) {
        registration.unregister().then(success => {
          // showBobPayStatus(!success);
          setSwInstalled(!success)
        })
      }
    })
  }

  const checkSwStatus = () => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration('/sw.js').then(function (registration) {
        if (registration) {
          // @ts-ignore
          if (registration.paymentManager) {
            registration.update()
          } else {
            unregisterPaymentAppServiceWorker()
          }
        }
        setSwInstalled(!!registration)
      })
    } else {
      setSwSupported(false)
    }
  }

  useEffect(() => {
    checkSwStatus()
  })

  const logout = () => {
    window.location.href = '/logout'
  }

  return (
    <div>
      <Navigation active="settings"></Navigation>
      <Content navigation>
        <div className="flex w-full h-full flex-col items-center justify-center">
          <Card className="w-full">
            {user.username}
            <div className="flex justify-end">
              <Button onClick={logout} textColour="error" type="text" buttonType="submit">
                LOGOUT
              </Button>
            </div>
          </Card>
          <div className="pb-10"></div>
          <Card className="w-full">
            <div className="text-headline-5 pb-10">Default account</div>
            <div className="pb-10"></div>
          </Card>
          <div className="pb-10"></div>
          <Card className="w-full">
            <div className="text-headline-5 pb-10">Payment Handler</div>
            <div className={swInstalled || !swSupported ? 'hidden' : ''}>
              <Button onClick={installSw} bgColour="primary" type="text">
                Install SW
              </Button>
            </div>
            <div className={swInstalled ? '' : 'hidden'}>
              <Button onClick={unregisterPaymentAppServiceWorker} bgColour="primary" type="text">
                Uninstall SW
              </Button>
            </div>
            <div className="">{swSupported ? '' : 'Payment Handler is not supported'}</div>
          </Card>
        </div>
      </Content>
    </div>
  )
}

Settings.getInitialProps = async ctx => {
  const user = await checkUser(ctx)

  return {
    user,
  }
}

export default Settings
