import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../../components'
import { checkUser, formatCurrency } from '../../utils'
import {AccountsService} from '../../services/accounts'
import { UsersService } from '../../services/users'

const accountService = AccountsService()
const usersService = UsersService()

type User = {
  id: string
}

type Account = {
  id: number,
  name: string,
  balance: string
}

type Props = {
  user: User
  account: Account
  token: string
}

const Overview: NextPage<Props> = ({user, account, token}) => {
  const [localAccount, setLocalAccount] = useState<Account>(account)
  const refreshAccounts = () => {
    accountService.getUserAccounts(user.id, token).then(accounts => {
      const account = accounts.filter(acc => acc.id === localAccount.id)[0]
      setLocalAccount(account)
    })
  }
  const [transactions, setTransactions] = useState([])

  const getTransactions = () => {
    accountService.transactions(localAccount.id.toString(), token).then(transactions => {
      setTransactions(transactions)
    })
  }

  useEffect(() => {
    getTransactions()
  }, [localAccount])

  const addFunds = async () => {
    await accountService.faucet(localAccount.id, token)
    getTransactions()
    refreshAccounts()
  }

  const formatDate = (date: string) => {
    const jsDate = new Date(date)
    return jsDate.getDay() + '-' + jsDate.getMonth() + '-' + jsDate.getUTCFullYear()
  }

  return (
    <div>
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <div className="flex flex-col sm:flex-row h-full justify-center">
          <div className="flex flex-col h-full w-full">
            <div className="flex flex-col sm:flex-row justify-between w-full">
              <Card className="flex flex-col w-full h-full">
                <div className="flex justify-between">
                  <div className="text-headline-4 flex-1 truncate">
                    {localAccount.name}
                  </div>
                  <div onClick={addFunds} className="flex">
                    <Button className="my-auto" type="text">
                      Add funds
                    </Button>
                  </div>
                </div>
                <div className="text-headline-5 truncate">
                  $ {formatCurrency(Number(localAccount.balance), 6)}
                </div>
              </Card>
            </div>
            <div className="flex mt-8 justify-between">
              <div className="text-headline-6 my-auto">
                Transactions
              </div>
            </div>
            <div className="flex flex-col justify-between w-full flex-wrap mt-8">
              {
                transactions.map(transaction => {
                  return (
                    <Card className="mb-4" key={transaction.id}>
                      <div className="flex flex-row">
                        <div className="button self-center text-purple">
                          {formatDate(transaction.createdAt)}
                        </div>
                        <div className={`flex-1 self-center text-right my-auto text-headline-6 ${transaction.amount < 0 ? 'text-red' : 'text-green'}`}>
                          $ {formatCurrency(transaction.amount, 6)}
                        </div>
                      </div>
                        
                    </Card>
                  )
                })
              }
            </div>
          </div>
        </div>
      </Content>
    </div>
  )
}

Overview.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)
  const accountId = +ctx.query.account
  const accounts = await accountService.getUserAccounts(user.id, user.token)
  const account = accounts.filter(acc => acc.id === accountId)[0]

  return {
    user,
    account,
    token: user.token
  }
}

export default Overview
