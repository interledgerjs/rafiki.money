import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../components'
import { checkUser, formatCurrency } from '../utils'
import {AccountsService} from '../services/accounts'
import Link from 'next/link'

const accountService = AccountsService()

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
  accounts: Array<any>
  token: string
}

const sideBar = (account: Account, token, refreshAccounts) => {

  const [transactions, setTransactions] = useState([])

  const getTransactions = () => {
    accountService.transactions(account.id.toString(), token).then(transactions => {
      setTransactions(transactions)
    })
  }

  useEffect(() => {
    getTransactions()
  }, [account])

  const addFunds = async () => {
    await accountService.faucet(account.id, token)
    getTransactions()
    refreshAccounts()
  }

  if(account) {
    return (
      <Card width="w-full">
        <div className="flex justify-between">
          <div className="text-headline-4 flex-1 truncate">
            {account.name}
          </div>
          <div onClick={addFunds} className="flex">
            <Button className="my-auto" type="text">
              Add funds
            </Button>
          </div>
        </div>
        <div className="text-headline-5 truncate">
          $ {formatCurrency(Number(account.balance), 6)}
        </div>
        <div className="mt-4">
          <div className="text-headline-6">
            Transactions
          </div>
          <div>
            {
              transactions.map(transaction => {
                return (
                  <div>
                    {transaction.amount}
                  </div>
                )
              })
            }
          </div>
        </div>
      </Card>
    )
  }
}

const Overview: NextPage<Props> = ({user, accounts, token}) => {

  const [localAccounts, setLocalAccounts] = useState<Array<Account>>(accounts)
  const [selectedAccountId, setSelectedAccountId] = useState<number>(accounts[0].id)

  const refreshAccounts = () => {
    accountService.getUserAccounts(user.id, token).then(accounts => {
      setLocalAccounts(accounts)
    })
  }

  return (
    <div className="flex">
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <div className="flex flex-col w-2/3">
            <div className="flex justify-between w-full">
              <Card>
                <div className="text-headline-5">
                  Total Balance
                </div>
                <div className="text-headline-3">
                  $ 10.000000
                </div>
              </Card>
              <Card>
                <div className="text-headline-5">
                  Payment Pointer
                </div>
                <div>
                  $pp@coil.com/p
                </div>
                <div className="flex justify-end">
                  <Button type="text">
                    Copy
                  </Button>
                </div>
              </Card>
            </div>
            <div className="flex mt-8 justify-between">
              <div className="text-headline-6 my-auto">
                Accounts
              </div>
              <div>
                <Link href="/accounts/create">
                  <a>
                    <Button type="solid">
                      Add Account
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap justify-between mt-8">
              {
                localAccounts.map(account => {
                  return (
                    <div key={account.id} onClick={() => setSelectedAccountId(account.id)}>
                      <Card className="my-4 h-32 pointer-cursor">
                        <div className="text-headline-5">
                          {account.name}
                        </div>
                        <div className="text-headline-6">
                          $ {formatCurrency(Number(account.balance), 6)}
                        </div>
                      </Card>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="flex h-full w-1/3 ml-12">
            {selectedAccountId ? sideBar(localAccounts.filter(acc => acc.id === selectedAccountId)[0], token, refreshAccounts.bind(this)) : null}
          </div>
        </div>
      </Content>
    </div>
  )
}

Overview.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)
  const accounts = await accountService.getUserAccounts(user.id, user.token)

  return {
    user,
    accounts,
    token: user.token
  }
}

export default Overview
