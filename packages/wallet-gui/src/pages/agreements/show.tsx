import React, { useState, useEffect, useRef } from 'react'
import { ishara } from '../../services/ishara'
import { Agreement } from '.'
import { RouteComponentProps } from 'react-router-dom'
import {formatCurrency, formatEpoch} from '../../utils'

export function useInterval(callback: Function, delay: number) {
  const savedCallback: any = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const AgreementTermInfo: React.FC<{ interval?: string, cycle?: string }> = ({ interval }) => {
  return (
    <p className="text-sm pt-1">{ interval ? `Recurring: ${interval}` : 'Once-off' }</p>
  )
}

const StatusPill: React.FC<{start: number, expiry: number}> = ({ start, expiry }) => {
  const now = Date.now()
  if (now < start) {
    return null
  }

  const message = (start < now && now <= expiry) ? 'Active' : 'Expired'
  const style = (start < now && now <= expiry) ? "bg-green-lighter text-green-darkest" : "bg-red-lighter text-red-darkest"
  return (
    <div className={`rounded-full py-2 px-4 ${style}`}>{message}</div>
  )
}
export const ShowAgreement: React.FC<RouteComponentProps<{id: string}>> = ({ match }) => {

  const [agreement, setAgreement] = useState<Agreement>()
  const [delay, setDelay] = useState(1000); // poll every second
  const [polledBalance, setPolledBalance] = useState<number>()

  useEffect(() => {
    let isMounted = true
    ishara.getMandate(match.params.id).then(agreement => {
      if(isMounted) {
        setAgreement(agreement)
        setPolledBalance(agreement.balance)
      }
    })
    return () => { isMounted = false }
  }, [match.params.id])

  // poll ishara for agreement balance
  useInterval(() => {
    if(agreement) {
      ishara.getMandate(match.params.id).then(agreement => {
        setPolledBalance(agreement.balance)
      })
    }
  }, delay)

  if (!agreement) {
    return null
  }

  return (
    <div className='mx-auto w-3/4 mt-16'>
      <div className="font-sans max-w-sm rounded overflow-hidden shadow-lg px-4 py-4 md:px-12 md:py-12 mx-auto flex flex-wrap justify-between">
        <div>
          <p>Currency</p>
          <p className="text-2xl text-center pt-2">{ agreement.asset.code }</p>
        </div>
        <div>
          <p>Amount</p>
          <p className="text-2xl text-center pt-2">{ formatCurrency(Number(agreement.amount), agreement.asset.scale) }</p>
        </div>
        <div>
          <p>Balance</p>
          <p className="text-2xl text-center pt-2">{ polledBalance ? formatCurrency(polledBalance, agreement.asset.scale) : null }</p>
        </div>
      </div>
      <table className='text-left w-full border-collapse mt-16 mx-auto shadow'>
        <thead>
          <div className="font-sans rounded-t overflow-hidden bg-grey-lighter px-6 py-4">
            <div className="w-full flex items-center justify-between">
              <p className="italic">{agreement.id}</p>
              <StatusPill start={agreement.start} expiry={agreement.expiry}/>
            </div>

            <p className="text-sm pt-4">{agreement.description}</p>
            <AgreementTermInfo interval={agreement.interval}/>
            <p className="text-sm pt-1">Start: {(formatEpoch(agreement.start))}</p>
            <p className="text-sm pt-1">Expiry: {(formatEpoch(agreement.expiry))}</p>
          </div>
        </thead>
        <tbody>
        {/* <tr className='border-b border-grey-light'>
          <p className="px-6 py-6 font-sans uppercase">Transactions</p>
        </tr> */}
        </tbody>
      </table>
    </div>
  )
}
