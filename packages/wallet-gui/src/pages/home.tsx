import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useContext } from 'react'
import { formatCurrency } from "../utils"
import { AuthContext } from '../App'
import { AccountsService } from '../services/accounts'

export interface AccountDetails {
  id: number
  name: string
  balance: number
  owner: number
}

const copyToClipboard = (text: string | null) => {
  if(text) {
    navigator.clipboard.writeText(text)
  }
}

const userPaymentPointer = (username: string) => {
  return username === '' ? null : `$rafiki.money/p/${username}`
}

const Home: React.FC = () => {
  const [accountList, setAccountList] = useState<Array<AccountDetails>>([])
  const { token, getUser, handleAuthError } = useContext(AuthContext)
  const accounts = AccountsService(handleAuthError)
  const [username, setUsername] = useState<string>('')
  const [hasDefaultAccount, setHasDefaultAccount] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    if(token !== '') {
      getUser().then(({ id, username, defaultAccountId }) =>{
        accounts.getAccounts(id, token).then(response => {
          if (isMounted) {
            setAccountList(response.data)
            setUsername(username)
            if(!defaultAccountId) {
              setHasDefaultAccount(false)
            }
          }
        })
      })
    }
    return () => { isMounted = false }
  }, [token])

  return (
    <div>
      <div className='max-w-xs rounded-lg shadow-md flex flex-col w-full my-16 px-6 py-4 mx-auto'>
        <div className="mb-6 text-lg text-grey-dark flex-1 text-base">
          Payment Pointer
        </div>
        <div className="w-full bg-grey-lighter px-2 py-2 rounded h-10 flex cursor-pointer" onClick={() =>copyToClipboard(userPaymentPointer(username))}>
          <code className="flex-1 my-auto overflow-x-auto whitespace-no-wrap">
            {userPaymentPointer(username)}
          </code>
          <div className="flex mx-auto my-auto no-underline">
            <img className="h-6" src="/icons/copy_icon.svg"/>
          </div>
        </div>
        {
          hasDefaultAccount ? null :
            <Link to={"settings"} className="mt-4">
                No default account set for Payment pointer. Click here to assign default account
            </Link>
        }
      </div>
      <div className='mx-auto max-w-lg mt-4'>
        <div className="flex">
          <div className="text-2xl text-grey-dark flex-1 text-base">
            Accounts
          </div>
          <Link to={`/accounts/create`} className="bg-white hover:bg-grey-lightest text-grey-darkest no-underline font-semibold py-2 px-4 border border-grey-light rounded shadow">
            Add Account
          </Link>
        </div>

        <div className="flex mt-8 flex-wrap">
          { accountList.map(account => <AccountCard key={'account_' + account.id} account={account}/>) }
        </div>

      </div>
    </div>
  );
}


type AccountCardProps = {
  account: AccountDetails
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  return (
    <Link className="max-w-xs rounded-lg shadow-md flex flex-col w-full mt-8 px-6 py-4 mx-8" to={`/accounts/${account.id}`} style={{textDecoration: 'none', color: 'inherit', height: '12rem'}}>
      <div className="flex flex-1">
        <div className="flex-1">
          <div className="text-3xl">
            {formatCurrency(account.balance, 6)}
          </div>
          <div className="text-sm text-grey">
            Balance
          </div>
        </div>
        <div>
          <img src={process.env.PUBLIC_URL + '/icons/xrp.svg'}/>
        </div>
      </div>
      <div className="text-grey-dark">
        {account.name}
      </div>
      <div>
      </div>
    </Link>
  )
}

export default Home;
