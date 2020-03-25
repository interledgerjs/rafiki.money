import React, { useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../components'
import { checkUser, formatCurrency } from '../utils'
import {AccountsService} from '../services/accounts'
import Link from 'next/link'

const accountService = AccountsService()

type Props = {
  accounts: Array<any>
}

const Overview: NextPage<Props> = ({accounts}) => {
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
                accounts.map(account => {
                  return (
                    <Card key={account.id} className="my-4 h-32">
                      <div className="text-headline-5">
                        {account.name}
                      </div>
                      <div className="text-headline-6">
                        $ {formatCurrency(account.balance, 6)}
                      </div>
                    </Card>
                  )
                })
              }
            </div>
          </div>
          <div className="flex h-full w-1/3 ml-12">
            <Card width="w-full">
              <div>
                Add an account to start
              </div>
            </Card>
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
    accounts
  }
}

export default Overview
