import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import ReactJson from 'react-json-view'
import axios from 'axios'
import parseLinkHeader from 'parse-link-header'

const HYDRA_ADMIN_URL = process.env.REACT_APP_HYDRA_ADMIN_URL || ''
const CALLBACK_URL = process.env.REACT_APP_CALLBACK_URL || ''

type Result = {
  type: string,
  data: any
}

type Amount = {
  value: number,
  currency: string
}

const App: React.FC = () => {

  const [amount] = useState({value: 10.00, currency: 'XRP'})
  const [results, setResults] = useState([] as Result[]);
  const [loading, setLoading] = useState(false);
  const [paymentPointer, setPaymentPointer] = useState('$localhost:3001/alice');

  async function subscribeIndieAuth () {
    if (paymentPointer !== '') {
      // fetch page at payment pointer to look for auth endpoint
      try {
        const formattedPaymentPointer = 'http://' + paymentPointer.slice(1)

        const response = await axios.get(formattedPaymentPointer)
        const parsedLinkHeaders = parseLinkHeader(response.headers['link'])

        // dynamically register public client on hydra
        const clientId = process.env.REACT_APP_CLIENT_ID || `http://localhost:${process.env.PORT || 3004}/payment-pointer`
        const clientData = {
          "client_id": clientId,
          "token_endpoint_auth_method": "none",
          "scope": "openid offline",
          "response_types": ["token", "code", "id", "id_token"],
          "grant-types": ["authorization_code", "refresh_token", "client_credentials", "implicit"],
          "redirect_uris": [CALLBACK_URL]
        }

        try {
          console.log('creating public client on hydra')
          await axios.post(`${HYDRA_ADMIN_URL}/clients`, clientData)
        } catch (error) {
          if (error.response.status !== 409) {
            console.log('error response', error.response.statusText)
            throw new Error('error creating client on hydra')
          }
          console.log('client already created', clientId)
        }

        const authUrl = parsedLinkHeaders!['authorization_endpoint'].url
        const authQuery = `?agreement=%7B%22asset%22:%7B%22scale%22:2,%22code%22:%22USD%22%7D,%22amount%22:%225%22%7D&client_id=${clientId}&response_type=code&scope=openid%20offline&state=abcdefghj&redirect_uri=${CALLBACK_URL}`
        window.location.href = authUrl + authQuery
      } catch (error) {
        console.log('error', error)
      }
    }
  }

  function renderResponses() {
    return (
      <div className="rounded overflow-hidden shadow-lg mx-auto my-8 px-6 py-4">
        <div className="font-bold">Responses</div>
        {results.map((item, index) => {
          return (
            <div className="my-2" key={index}>
              <div>{item.type}</div>
              <div className="border border-grey-light rounded overflow-x-scroll flex">
                <ReactJson src={item.type === 'response' ? item : {code: item.data.code, message: item.data.message}} />
              </div>
            </div>
          )
        })
        }
      </div>
    )
  }

  return (
    // <div style="background-image: url(./base.png); display: table; margin: 0 auto; height: 100%;">
    // </div>
    <div className="w-full h-full flex flex-col">
      <div className="mx-auto">
        <img src="./top.png"/>
        <div style={{
          backgroundImage: "url('./base.png')"
        }} className="-mt-1 pb-8">
          <div className="flex flex-col justify-center mx-auto max-w-xs py-8">
            <label className="block text-grey-darker text-sm font-bold mb-2">
              Payment pointer
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="payment-pointer" type="text" placeholder="$example.com/alice" value='$localhost:3001/alice' onChange={event => setPaymentPointer(event.currentTarget.value)} />
          </div>
          <div className="flex justify-center">
            <div className="bg-grey-lighter hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-64">
                {
                  loading ?
                  <div className="h-12 text-grey-darkest font-bold align-middle flex items-center justify-center rounded border border-grey mx-auto">
                    <ClipLoader sizeUnit={"px"} size={16}/> 
                  </div> 
                  :
                  <div className="h-12 text-grey-darkest font-bold align-middle flex items-center justify-center rounded cursor-pointer order border-grey mx-auto" onClick={subscribeIndieAuth}>
                    <span>Subscribe using Coil Purse</span>
                  </div>
                }
            </div>
          </div>
        </div>
        {/* <img src="./bottom.png"/> */}
        {renderResponses()}
      </div>
    </div>
  );
}

export default App;
