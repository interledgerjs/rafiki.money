import React, { useEffect, useState, useRef } from 'react'
import Layout from '../src/Layout'
import {NextPage} from "next";
import axios from 'axios'
import {IlpPrepare, serializeIlpPrepare, deserializeIlpPacket, deserializeIlpReject} from "ilp-packet"

const FULFILLMENT = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
const CONDITION =  Buffer.from('66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925', 'hex')

export const formatCurrency = (value: number, scale: number) => {
  return (value*10**(-scale)).toFixed(scale)
}


const pay = async (amount: string, address:string, url: string, token: string) => {
  const p: IlpPrepare = {
    amount: amount,
    executionCondition: CONDITION,
    expiresAt: new Date(Date.now() + 30000),
    destination: address,
    data: FULFILLMENT,
  }

  const serPacket = serializeIlpPrepare(p)
  return axios.post(url, serPacket , {
    headers: {
      accept: 'application/octet-stream',
      'content-type': 'application/octet-stream',
      authorization: 'Bearer ' + token
    },
    responseType: 'arraybuffer'
  }).then(resp => {
    const responsePacket = deserializeIlpPacket(Buffer.from(resp.data))
    if(responsePacket.type === 14) {
      const reject = deserializeIlpReject(Buffer.from(resp.data))
      console.log(reject)
      throw new Error('Failed packet')
    }
    return responsePacket.data
  })
}

type SentState = {
  total: number,
  sent: number,
  failed: number
}

interface Props {
  accessToken: string | null,
  definedAmount: string | null
}

const Page: NextPage<Props> = ({accessToken, definedAmount}) => {

  const [amount, setAmount] = useState<string>("10")
  const [total, setTotal] = useState<string>(definedAmount || "100")
  const [address, setAddress] = useState<string>("test.rafikius1.merchant")
  const [url, setUrl] = useState<string>("https://rafiki.money/ilp")
  const [token, setToken] = useState<string>(accessToken || '')

  const [sentState, setSentState] = useState<Array<SentState>>([])

  const [isSending, setIsSending] = useState<boolean>(false)

  const sendPayment = async () => {
    if(!isSending) {
      setIsSending(true)
      const payments = new Array<Promise<any>>()
      let totalSent = 0
      let succeeded = 0
      let failed = 0

      for(let i = 0; i < Math.floor(parseInt(total)/parseInt(amount)); i++) {
        const payment = pay(amount,address, url, token).then(data => {
          totalSent += parseInt(amount)
          succeeded += parseInt(amount)
        }).catch(error => {
          totalSent += parseInt(amount)
          failed += parseInt(amount)
        })
        payments.push(payment)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      await Promise.all(payments)

      const state = sentState
      state.unshift({
        total: totalSent,
        sent: succeeded,
        failed: failed
      })
      setSentState(state)
      setIsSending(false)
    } else {
      console.log('cant send while sending')
    }
  }

  return (
    <Layout title="Complete Payment">
      <div className="flex flex-col w-full h-full">
        <div className="max-w-sm w-full shadow-md mx-auto mt-8 flex flex-col bg-white rounded-lg">
          <div className="mx-6 py-6">
            <div className="mb-4">
              <label className="block text-grey-darker text-sm font-bold mb-2">
                Endpoint URL
              </label>
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                id="endpoint" type="text" placeholder="Endpoint URL"/>
            </div>
            <div className="mb-4">
              <label className="block text-grey-darker text-sm font-bold mb-2">
                Token
              </label>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                id="token" type="text" placeholder="Token"/>
            </div>
            <div className="mb-4">
              <label className="block text-grey-darker text-sm font-bold mb-2">
                ILP Address
              </label>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                id="address" type="text" placeholder="ILP Address"/>
            </div>
            <div className="mb-4">
              <label className="block text-grey-darker text-sm font-bold mb-2">
                Packet Amount
              </label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                id="amount" type="number" placeholder="Amount"/>
            </div>
            <div className="mb-4">
              <label className="block text-grey-darker text-sm font-bold mb-2">
                Total Amount
              </label>
              <input
                value={total}
                onChange={(event) => setTotal(event.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline"
                id="amount" type="number" placeholder="Amount"/>
            </div>
          </div>
          <div className="mx-auto my-2">
            <button
              className="text-center bg-white hover:bg-grey-lightest text-grey-darkest font-semibold py-2 px-4 border border-grey-light rounded shadow w-48"
              onClick={sendPayment}>
              {isSending ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
        <div className="mt-5">
          {sentState.map((state, index) => {
            return (
              <div key={index} className="max-w-sm w-full shadow-md mx-auto mb-2 flex bg-white rounded-lg">
                <div className="flex flex-1 flex-col text-center my-3">
                  <div className="text-2xl text-grey-darker">
                    $ {formatCurrency(state.total, 2)}
                  </div>
                  <div className="text-sm text-grey">
                    Total
                  </div>
                </div>
                <div className="flex flex-1 flex-col text-center my-3">
                  <div className="text-2xl text-grey-darker">
                    $ {formatCurrency(state.sent, 2)}
                  </div>
                  <div className="text-sm text-grey">
                    Success
                  </div>
                </div>
                <div className="flex flex-1 flex-col text-center my-3">
                  <div className="text-2xl text-grey-darker">
                    $ {formatCurrency(state.failed, 2)}
                  </div>
                  <div className="text-sm text-grey">
                    Failed
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

Page.getInitialProps = async ({ query: { token, amount } }) => {
  const accessToken: string = String(token || '')

  return {
    accessToken,
    definedAmount: String(amount || '')
  }
}

export default Page
