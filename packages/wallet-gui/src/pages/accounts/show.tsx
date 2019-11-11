import React, { useState, useEffect, useContext } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { AccountsService } from '../../services/accounts'
import Amount from "../../components/amount"
import { AuthContext } from '../../App'
import { useInterval } from "../agreements/show"
import { SendModal } from '../../components/send-modal'

type Transaction = {
  id: string
  debitAccountId: number
  creditAccountId: number
  amount: string
  epoch: number
  Description: string
}

type AccountSummary = {
  id: number
  name: string
  balance: string
}

export const ShowAccount: React.FC<RouteComponentProps<{ id: string }>> = ({ match }) => {
  const id = match.params.id
  const [count, setCount] = useState(0)
  const [isSend, setIsSend] = useState(false)
  const [accountSummary, setAccountSummary] = useState<AccountSummary>()
  const [transactions, setTransactions] = useState<Array<Transaction>>([])
  const { token, handleAuthError } = useContext(AuthContext)
  const accounts = AccountsService(handleAuthError)

  useEffect(() => {
    if(token !== '') {
      let isMounted = true
      accounts.getAccount(id, token).then((accountSummary: any) => {
        if (isMounted) {
          setAccountSummary(accountSummary)
        }
      }).catch((error: any) => {
        console.log('error account summary', error.response)
      })
      return () => { isMounted = false }
    }
  }, [token, count])

  // poll account balance
  useInterval(() => {
    if (accountSummary) {
      accounts.getAccount(id, token).then((accountSummary: any) => {
          setAccountSummary(accountSummary)
      }).catch((error: any) => {
        console.log('error account summary', error.response)
      })
    }
  }, 1000)

  useEffect(() => {
    if(token !== '') {
      let isMounted = true
      accounts.getTransactions(id, token).then((transactions: any) => {
        if (isMounted) {
          console.log('transactions', transactions)
          setTransactions(transactions)
        }
      }).catch((error: any) => {
        console.log('error transactions', error.response)
      })
      return () => { isMounted = false }
    }
  }, [token, count])

  const addFunds = async () => {
    if (accountSummary) {
      const result = await accounts.addFunds(accountSummary.id.toString(), token).catch(error => {
        console.log('Error Adding Funds')
      })
      setCount((count + 1))
    }
  }

  const sendFunds = async () => {
    if (accountSummary) {
      setIsSend(true)
    }
  }

  if(!accountSummary) {
    return null
  }

  return (
    <div className='mx-auto max-w-lg mt-4 mb-8'>
      <div className="my-4 flex justify-between">
        <div onClick={ sendFunds } className="bg-white hover:bg-grey-lightest text-grey-darkest no-underline font-semibold py-2 px-4 border border-grey-light rounded shadow w-32 cursor-pointer text-center">
          Send
        </div>
        <div onClick={ addFunds } className="bg-white hover:bg-grey-lightest text-grey-darkest no-underline font-semibold py-2 px-4 border border-grey-light rounded shadow w-32 cursor-pointer text-center">
          Add Funds
        </div>
      </div>
      <div className="rounded-lg shadow-lg px-4 py-8 flex justify-center mb-8">
        <div className="text-center">
          <div className="text-3xl text-green-darker">
            {  <Amount value={ accountSummary.balance } />}
          </div>
          <div className="mt-2 text-grey font-bold">
            { accountSummary.name}
          </div>
        </div>
      </div>
      <div>
        <div className="text-2xl font-light text-grey-dark ml-2 mb-2">
          History
        </div>
        <div className="rounded-lg shadow-lg px-4 py-4">
          { transactions ? transactions.map(transaction => <TransactionRow key={ 'transaction_' + transaction.epoch } { ...transaction } accountId={ Number(id) } />) : null }
        </div>
      </div>
      <SendModal token={token} accountId={accountSummary.id.toString()} open={isSend} dismiss={() => setIsSend(false)}/>
    </div>
  )
}

const formatDate = (date: number) => {
  return (new Date(date)).toLocaleString()
}

const TransactionRow: React.FC<Transaction & { accountId: number }> = ({ Description, amount, epoch }) => {
  return (
    <div className='border-b border-grey-light flex mx-2 py-3 hover:bg-grey-lighter'>
      <div className="flex-1 text-grey-dark font-semibold">
        <div>Transaction</div>
        <div className="text-grey font-light">{Description}</div>
      </div>
      <div className="flex-1 flex text-grey justify-center my-auto">
        {formatDate(epoch)}
      </div>
      <div className="flex-1 text-lg flex justify-center my-auto">
        {
          parseInt(amount) <= 0 ?
            <div className="flex justify-end text-grey-dark font-semibold">
              <Amount value={ amount } />
            </div> :
            <div className="flex justify-end text-green-lighter font-semibold">
              <Amount value={ amount } />
            </div>
        }
      </div>
    </div>
  )
}
