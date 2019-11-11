import React, { useState, ChangeEvent, useContext } from 'react'
import { RouteComponentProps } from 'react-router'
import { AccountsService } from '../../services/accounts'
import { AuthContext } from '../../App'

const Error: React.FC<{error: string | undefined}> = ({ error }) => {
  return error ? (
    <div className="bg-red-lightest border border-red-light text-red-dark px-4 py-3 rounded relative" role="alert">
      <p className="block sm:inline">Something seriously bad happened.</p>
    </div>
  ) : null
}
export const CreateAccount: React.FC<RouteComponentProps> = ({ history}) => {
  const [accountName, setAccountName] = useState('')
  const [errorMessage, setErrorMessage] = useState()
  const { token, handleAuthError } = useContext(AuthContext)
  const accounts = AccountsService(handleAuthError)

  async function submit ()  {
    if (accountName === '') {
      return
    }

    try {
      await accounts.createAccount(accountName, token)
      history.push('/')
    } catch (error) {
      console.log(error.response)
      setErrorMessage(error.response.statusText)
    }
  }

  function handleAccountNameChange (event: ChangeEvent<HTMLInputElement>) {
    setAccountName(event.currentTarget.value)
  }

  return (
    <div className='mx-auto w-1/2 mt-4'>
      Create Account

      <form className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-4'>
        <Error error={errorMessage}/>
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2">Account Name</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Cheque account" onChange={handleAccountNameChange} />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={submit}>Create</button>
        </div>
      </form>
    </div>
  )
}
