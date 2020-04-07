import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../../components'
import { checkUser, formatCurrency } from '../../utils'
import {AccountsService} from '../../services/accounts'
import Link from 'next/link'
import { UsersService } from '../../services/users'
import Clipboard from 'react-clipboard.js'
import { useRouter } from 'next/router'

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
  accounts: Array<any>
  token: string
  balance: number
  paymentPointer: string
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

  const formatDate = (date: string) => {
    const jsDate = new Date(date)
    return jsDate.getDay() + '-' + jsDate.getMonth() + '-' + jsDate.getUTCFullYear()
  }

  if(account) {
    return (
      <Card width="w-full" className="flex flex-col">
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
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="text-headline-6">
            Transactions
          </div>
          <div>
            {
              transactions.map(transaction => {
                return (
                  <div key={transaction.id} className="flex w-full my-4 py-2 px-2 border border-border rounded">
                    <div className="leading-tight">
                      <div className="overline text-purple">
                        {account.name}
                      </div>
                      <div className="text-headline-6">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className={`flex-1 self-center text-right my-auto text-headline-6 ${transaction.amount < 0 ? 'text-red' : 'text-green'}`}>
                      $ {formatCurrency(transaction.amount, 6)}
                    </div>
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

const Overview: NextPage<Props> = ({user, accounts, token, balance, paymentPointer}) => {
  const router = useRouter()

  const [localAccounts, setLocalAccounts] = useState<Array<Account>>(accounts)
  const [localBalance, setLocalBalance] = useState<number>(balance)
  const [selectedAccountId, setSelectedAccountId] = useState<number>(accounts[0].id)

  const refreshAccounts = () => {
    accountService.getUserAccounts(user.id, token).then(accounts => {
      setLocalAccounts(accounts)
    })
    usersService.getBalance(token).then(balance => {
      setLocalBalance(balance.balance)
    })
  }

  return (
    <div>
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <div className="flex flex-col sm:flex-row h-full justify-center">
          <div className="flex flex-col w-full sm:w-2/3">
            <div className="flex flex-col sm:flex-row justify-between w-full">
              <Card>
                <div className="text-headline-5">
                  Total Balance
                </div>
                <div className="text-headline-4">
                  $ {formatCurrency(localBalance, 6)}
                </div>
              </Card>
              <Card className="mt-4 sm:mt-0">
                <div className="text-headline-5">
                  Payment Pointer
                </div>
                <div>
                  { paymentPointer }
                </div>
                <div className="flex justify-end">
                  <Clipboard className="button min-w-64 py-2 px-4 rounded focus:outline-none text-primary hover:bg-primary-100 active:bg-primary-200" data-clipboard-text={paymentPointer}>
                    Copy
                  </Clipboard>
                </div>
              </Card>
            </div>
            <div className="flex mt-8 justify-between">
              <div className="text-headline-6 my-auto text-on-surface">
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
            <div className="flex sm:hidden flex-col sm:flex-row justify-between w-full flex-wrap mt-8">
              {
                localAccounts.map(account => {
                  return (
                    <div key={account.id} onClick={() => router.push(`/overview/${account.id}`)}>
                      <Card className="mb-4 h-32 cursor-pointer">
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
            <div className="hidden sm:flex flex-col sm:flex-row justify-between w-full flex-wrap mt-8">
              {
                localAccounts.map(account => {
                  return (
                    <div key={account.id} onClick={() => setSelectedAccountId(account.id)}>
                      <Card className="mb-4 h-32 cursor-pointer">
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
          <div className="hidden sm:flex h-full w-1/3 ml-12">
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
  const balance = await usersService.getBalance(user.token)
  const paymentPointer = await usersService.getPaymentPointer(user.token)

  return {
    user,
    accounts,
    token: user.token,
    balance: balance.balance,
    paymentPointer: paymentPointer.paymentPointer
  }
}

export default Overview
