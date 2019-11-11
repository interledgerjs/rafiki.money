import React, { useState, useMemo, MouseEvent } from 'react'
import Layout from '../src/Layout'
import axios from 'axios'
import getConfig from 'next/config'
import {NextPage} from "next"

const toVisibileValue = (amount: number) => {
  return (amount/100).toFixed(2)
}


const Page: NextPage = () => {
  const { publicRuntimeConfig } = getConfig()

  const { CALLBACK_URL, CLIENT_ID, MOCK_TLS_TERMINATION } = publicRuntimeConfig

  const [totalBurgers, setTotalBurgers] = useState(1)
  const [totalFries, setTotalFries] = useState(1)
  const [totalMilkshakes, setTotalMilkshakes] = useState(1)
  const [paymentPointer, setPaymentPointer] = useState('')
  const [paymentPointerError, setPaymentPointerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  const total = useMemo(
    () => {
      return totalBurgers*499 + totalFries*299 + totalMilkshakes*499
    },
    [totalBurgers,totalFries, totalMilkshakes]
  )

  const checkout = async (event: MouseEvent<HTMLButtonElement>) => {
    if(!isSubmitting && paymentPointer !== '') {
      setIsSubmitting(true)
      setPaymentPointerError('')

      const sanitizedPP = paymentPointer.startsWith('$') ? 'https://' + paymentPointer.slice(1) : paymentPointer
      console.log('Getting from ', sanitizedPP)
      const response = await axios.get(sanitizedPP).then(response => {
        return response.data
      }).catch(error => {
        console.log('error getting pp')
        setPaymentPointerError('Invalid Payment Pointer')
        setIsSubmitting(false)
        throw error
      })
      console.log('Server meta data received from payment pointer: ', response)
      console.log('Creating mandate at: ', response.payment_mandates_endpoint)
      debugger
      // create mandate
      const { data } = await axios.post(response.payment_mandates_endpoint, { asset: { code: 'USD', scale: 2 }, amount: total.toString(), scope: paymentPointer, description: "ILP Eats Order" })
      const mandateId = data.id

      // request authorization for mandate
      const authQuery = `?client_id=${CLIENT_ID}&response_type=code&scope=openid%20offline%20mandates.${mandateId}&state=abcdefghj&redirect_uri=${CALLBACK_URL}`
      console.log('Mandate created. ', data)
      console.log('Redirecting to authorization endpoint to make an authorization request of:', authQuery.substring(1))
      debugger
      window.location.href = response.authorization_endpoint + authQuery
      setIsSubmitting(false)
    }
    if(paymentPointer === '') {
      setPaymentPointerError('Please enter a payment pointer')
    }
  }

  return (
    <Layout title="Checkout">
      <div className="max-w-xl mx-auto mt-8 text-4xl text-grey-darkest">
        ILP EATS
      </div>
      <div className="max-w-xl flex shadow-lg rounded-lg bg-white mx-auto px-16 py-16 mt-16">
        <div className="w-2/3 flex flex-col ">
          <div className="my-4 text-grey-darker text-2xl">
            Cart
          </div>
          <div className="flex-1">
            <div className="flex my-4">
              <div className="mr-2">
                <img className="rounded-full" src="https://source.unsplash.com/88YAXjnpvrM/100x100"/>
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker justify-center">
                Hamburger
              </div>
              <div className="flex flex-1 my-auto mx-2">
                <input className="w-8 h-6 border-grey-light border-2 mx-auto rounded" type="number" min="0" value={totalBurgers} onChange={(event) => setTotalBurgers(event.target.value ? parseInt(event.target.value) : 0)}  />
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker text-lg">
                $4.99
              </div>
            </div>
            <div className="border-b-2 border-grey-light"/>
            <div className="flex my-4">
              <div className="mr-2">
                <img className="rounded-full" src="https://source.unsplash.com/vi0kZuoe0-8/100x100"/>
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker justify-center">
                Fries
              </div>
              <div className="flex flex-1 my-auto mx-2">
                <input className="w-8 h-6 border-grey-light border-2 mx-auto rounded" type="number" min="0" value={totalFries} onChange={(event) => setTotalFries(event.target.value ? parseInt(event.target.value) : 0)}/>
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker text-lg">
                $2.99
              </div>
            </div>
            <div className="border-b-2 border-grey-light"/>
            <div className="flex my-4">
              <div className="mr-2">
                <img className="rounded-full" src="https://source.unsplash.com/gjFfm8ADhQw/100x100"/>
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker justify-center">
                Milkshake
              </div>
              <div className="flex flex-1 my-auto mx-2">
                <input className="w-8 h-6 border-grey-light border-2 mx-auto rounded" type="number" min="0" value={totalMilkshakes} onChange={(event) => setTotalMilkshakes(event.target.value ? parseInt(event.target.value) : 0)} />
              </div>
              <div className="flex flex-1 my-auto mx-2 text-grey-darker text-lg">
                $4.99
              </div>
            </div>
            <div className="border-b-2 border-grey-light"/>
          </div>
          <div className="my-4 justify-end flex mr-16">
            <div>
              <div className="text-grey-darker text-3xl">
                $ {toVisibileValue(total)}
              </div>
              <div className="text-grey text-center">
                Subtotal
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/3 ml-4">
          <div className="bg-grey-lightest h-full shadow rounded-lg flex flex-col px-6 py-12">
            <div className="text-grey-darkest font-bold text-2xl">
              Payments Details
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-grey-dark my-4">
                ILP Eats is powered by ILP.
                Go to https://rafiki.money to get an ILP enabled account Today!
              </div>
              <div className="flex items-center border-b border-b-2 border-teal py-2 mt-4">
                <input
                  value={paymentPointer}
                  onChange={(event) => {setPaymentPointer(event.target.value); setPaymentPointerError('')} }
                  className="appearance-none bg-transparent border-none w-full text-grey-darker mr-3 py-1 px-2 leading-tight focus:outline-none"
                  type="text" placeholder="$paymentpointer.org/alice"/>
              </div>
              {
                paymentPointerError !== '' ?
                  <div className="mt-2 text-xs text-red-dark">
                    {paymentPointerError}
                  </div> : null
              }
            </div>
            <div className="w-full">
              <button
                onClick={checkout}
                className="w-full h-10 shadow bg-teal hover:bg-teal-light focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button">
                {isSubmitting ? '...' : 'Checkout'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {}
}

export default Page
