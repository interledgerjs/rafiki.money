import React, {FC, useState} from 'react'
import {ToggleLayer, anchor} from "react-laag"

const amounts = [
  10,
  20,
  50
]

const sendPayment = async (close: any) => {
  try {
    const request = new PaymentRequest(
      [{supportedMethods: "https://rafiki.money"}],
      {total: {label: "Payment", amount: {currency: "USD", value: "0.10"}}});
    const response = await request.show();
    await response.complete("success");
  } catch (e) {
    console.log(e)
  }
  console.log("SEND THE MONEY!!!"); close()
}

const Tipping: FC = () => {

  const [amount, setAmount] = useState(10)

  return (
    <ToggleLayer
      closeOnOutsideClick={true}
      placement={{anchor: anchor.TOP_CENTER}}
      renderLayer={({layerProps, isOpen, close}) =>
        // only render on `isOpen`
        isOpen && (
          <div
            // for calculation stuff
            ref={layerProps.ref}
            style={{
              // inject calculated positional styles
              ...layerProps.style,
            }}
            className="bg-grey-lighter shadow-lg rounded-lg"
          >
            <div className="flex justify-between mx-4 my-4">
              {
                amounts.map(amt => {
                  return (
                    <div className="flex-1 text-center my-auto mx-2">
                      <div
                        onClick={() => setAmount(amt)}
                        className={`${amount === amt ? 'bg-green-light' : 'bg-white'} px-2 py-2 rounded-lg shadow-md hover:bg-green-lighter cursor-pointer`}>
                        $ {(amt/100).toFixed(2)}
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div className="justify-center flex my-2">
              <button
                onClick={() => sendPayment(close)}
                className="bg-white hover:bg-grey-lightest text-grey-darkest font-semibold py-2 px-4 border border-grey-light rounded-full shadow">
                Send
              </button>
            </div>
          </div>
        )
      }
    >
      {({toggle, triggerRef}) => (
        <div
          className="cursor-pointer"
          ref={triggerRef}
          onClick={toggle}
        >
          <img src="/static/ilp_icon.png"/>
        </div>
      )}
    </ToggleLayer>
  )
}

export default Tipping
