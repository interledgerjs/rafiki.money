import React, { ChangeEvent, useState } from 'react'
import ReactModal from 'react-modal'
import axios from 'axios'

type Props = {
  accountId: string;
  token: string;
  open: boolean;
  dismiss: () => void
}

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
}

ReactModal.setAppElement(document.getElementById('root') || '')

const renderPaymentPointerError = (error: string | undefined) => {
    return <p className="mt-1 ml-1 text-red-dark text-xs italic h-1">{error || ' '}</p>
}

const renderAmountError = (error: string | undefined) => {
  return <div className="mt-1 ml-1 text-red-dark text-xs italic h-1">{error || ' '}</div>
}

const amountToDrops = (value: string) => {
  return Math.floor(parseFloat(value) * 1000000)
}


export const SendModal: React.FC<Props> = ({ open, dismiss, token, accountId }) => {

  const [isSending, setIsSending] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>()
  const [paymentPointer, setPaymentPointer] = useState<string>()
  const [paymentPointerError, setPaymentPointerError] = useState<string>()
  const [amountError, setAmountError] = useState<string>()
  const [isFinished, setIsFinished] = useState<boolean>()


  function dismissModal () {
    if(!isSending) {
      setPaymentPointer(undefined)
      setAmountError(undefined)
      setPaymentPointerError(undefined)
      setAmountError(undefined)
      dismiss()
    }
  }

  async function streamPayment () {
    if(!isSending && !amountError) {
      setIsSending(true)
      if(paymentPointer === '' || paymentPointer === undefined) {
        setPaymentPointerError('No payment pointer set')
        setIsSending(false)
        return
      } else {
        setPaymentPointerError(undefined)
      }

      if(amount === '' || amount === undefined) {
        setAmountError('No amount set')
        setIsSending(false)
        return
      } else {
        setAmountError(undefined)
      }

      console.log(amountToDrops(amount))

      await axios.post('https://rafiki.money/api/stream', {
        paymentPointer,
        amount: amountToDrops(amount).toString(),
        accountId
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      }).then(resp => {
        setIsFinished(true)
      }).catch(error => {
        setPaymentPointerError('Invalid Payment Pointer')
        console.log('error', error)
      }).finally(() => {
        setIsSending(false)
      })
    }
  }

  function handleChangeAmount (event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value)
    if(amountError !== undefined && event.target.validity.valid) {
      setAmountError(undefined)
    }
    if(!event.target.validity.valid) {
      setAmountError('Invalid amount set')
    }
  }

  return (
    <ReactModal
      style={customStyles}
      isOpen={open}
    >
      <div style={{width: '24rem'}}>
        <div className="flex justify-end mb-4">
          <div className="cursor-pointer" onClick={ dismissModal }>
            Close
          </div>
        </div>
      {
        isFinished ?
          <div className="w-full mx-auto flex flex-col">
            <div className="flex-1 text-center text-3xl text-grey-dark">
              Success
            </div>
            <div className="text-center text-4xl text-grey-darkest mt-6 mb-2">
              {(amountToDrops(amount || '0')/1000000).toFixed(6)} XRP
            </div>
            <div className="text-center text-grey-darker">
              Sent to {paymentPointer}
            </div>
          </div> :
            <div className="w-full mx-auto">
              <div className="mb-4">
                <label className="block text-grey-darker text-sm font-bold mb-2">Payment Pointer</label>
                <input autoComplete="off" value={paymentPointer || ''} onChange={(event) => setPaymentPointer(event.target.value)} className={"shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" + (paymentPointerError ? ' border-red' : '')} id="username" type="text" placeholder="$rafiki.money/p/paymentpointer" />
                {renderPaymentPointerError(paymentPointerError)}
              </div>
              <div className="mb-4">
                <label className="block text-grey-darker text-sm font-bold mb-2">Amount (XRP)</label>
                <input autoComplete="off" pattern="^[0-9]*\.?[0-9]*$" type="text" value={amount || ''} onChange={handleChangeAmount} className={"shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" + (amountError ? ' border-red' : '')} id="amount" placeholder="2.000000" />
                {renderAmountError(amountError)}
              </div>
              <div className="flex justify-center mt-8">
                <button onClick={streamPayment}  className="w-24 text-md font-semibold rounded-full px-4 py-1 leading-normal bg-white border border-blue text-blue hover:bg-blue hover:text-white focus:outline-none">
                  {isSending ? '....' : 'Send'}
                </button>
              </div>
            </div>
      }
      </div>
    </ReactModal>
  )
}
