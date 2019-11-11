import React, {ChangeEvent, useContext, useEffect, useState} from "react"
import {RouteComponentProps} from "react-router"
import {AuthContext} from "../../App"
import {AccountsService} from "../../services/accounts"
import {AccountDetails} from "../home"
import {UsersService} from "../../services/users"

export const UserSettings: React.FC<RouteComponentProps> = ({ history}) => {
  const [accountList, setAccountList] = useState<Array<AccountDetails>>([])
  const [user, setUser] = useState<any>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [defaultAccountId, setDefaultAccountId] = useState<string>('-1')
  const { token, getUser, handleAuthError } = useContext(AuthContext)
  const accounts = AccountsService(handleAuthError)
  const users = UsersService()

  useEffect(() => {
    let isMounted = true
    if(token !== '') {
      getUser(true).then((user) =>{
        accounts.getAccounts(user.id, token).then(response => {
          if (isMounted) {
            setAccountList(response.data)
            setUser(user)
            if(user.defaultAccountId) {
              setDefaultAccountId(user.defaultAccountId)
            }
          }
        })
      })
    }
    return () => { isMounted = false }
  }, [token])

  async function submit ()  {
    if(!submitting) {
      if (defaultAccountId === '-1') {
        return
      }
      setSubmitting(true)

      try {
        await users.update(user.id, {defaultAccountId}, token).then(user => {
          setDefaultAccountId(user.defaultAccountId)
        })
      } catch (error) {

      }
      setSubmitting(false)
    }
  }

  return (
    <div className='mx-auto w-1/2 mt-4'>
      <div>
        User Settings
      </div>

      <form className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mt-4'>
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2">Default Account</label>
          <div className="inline-block relative w-64">
            <select
              value={defaultAccountId}
              onChange={(event => setDefaultAccountId(event.target.value))}
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                <option value={'-1'}></option>
              {
                accountList.map(account => {
                  return (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  )
                })
              }
            </select>
            <div className="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-24" onClick={submit} type="button">
            {submitting ? '...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
