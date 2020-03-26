import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../components'
import { checkUser, formatCurrency } from '../utils'
import { AccountsService } from '../services/accounts'
import { DonutChart } from '../components/donutChart'

type Mandate = {
  id: string
  name: string
  description: string,
  assetCode: string,
  assetScale: number,
  amount: number,
  balance: number,
  startAt: string,
  expireAt?: string,
  interval?: string,
  scope: string
}

type Props = {
  mandates?: Array<Mandate>
  token: string
}

const accountService = AccountsService()

const sideBar = (mandate: Mandate, token) => {
  const [transactions, setTransactions] = useState([])

  const getTransactions = () => {

  }

  useEffect(() => {
    getTransactions()
  }, [mandate])

  const formatDate = (date: string) => {
    const jsDate = new Date(date)
    return jsDate.getDay() + '-' + jsDate.getMonth() + '-' + jsDate.getUTCFullYear()
  }

  if(mandate) {
    return (
      <Card width="w-full" className="flex flex-col">
        <div className="flex justify-end">
          <Button type="text" textColour="red">
            Cancel
          </Button>
        </div>
        <div>
          <DonutChart
            available={Number(formatCurrency(mandate.balance,mandate.assetScale))}
            used={Number(formatCurrency(mandate.amount - mandate.balance,mandate.assetScale))}
          />
        </div>
        <div className="text-headline-5 truncate">
          $ {formatCurrency(Number(mandate.amount), mandate.assetScale)}
        </div>
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="text-headline-6">
            Transactions
          </div>
          <div>
            {/*{*/}
            {/*  transactions.map(transaction => {*/}
            {/*    return (*/}
            {/*      <div className="flex w-full my-4 py-2 px-2 border rounded">*/}
            {/*        <div className="leading-tight">*/}
            {/*          <div className="overline text-purple">*/}
            {/*            {account.name}*/}
            {/*          </div>*/}
            {/*          <div className="text-headline-6">*/}
            {/*            {formatDate(transaction.createdAt)}*/}
            {/*          </div>*/}
            {/*        </div>*/}
            {/*        <div className={`flex-1 text-right my-auto text-headline-6 ${transaction.amount < 0 ? 'text-red' : 'text-green'}`}>*/}
            {/*          $ {formatCurrency(transaction.amount, 6)}*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    )*/}
            {/*  })*/}
            {/*}*/}
          </div>
        </div>
      </Card>
    )
  }
  return (
    <Card width="w-full" className="flex flex-col">
      <div className="my-auto flex flex-col">
        <img className="mx-auto" src="/choice.png"/>
        <div className="mx-auto mt-6 text-headline-6">
          Select a mandate to get started
        </div>
      </div>
    </Card>
  )
}

const Mandates: NextPage<Props> = ({mandates, token}) => {

  const [selectedMandateId, setSelectedMandateId] = useState<string>(mandates ? mandates[0].id : undefined)

  const selectMandate = (id: string) => {
    setSelectedMandateId(id)
  }

  return (
    <div className="flex">
      <Navigation active="mandates"></Navigation>
      <Content>
        <div className="w-full flex flex-row h-full">
          <div className="w-2/3 flex flex-col">
            <div className="flex justify-between">
              <div>
                Search
              </div>
              <div>
                Selector
              </div>
            </div>
            <Card width="w-full" className="mt-8 px-0 pt-0 pb-0">
              <table className="w-full">
                <thead>
                <tr>
                  <th className="px-4 py-4"></th>
                  <th className="px-4 py-4 text-body-2 text-right">Balance</th>
                  <th className="px-4 py-4 text-body-2">Interval</th>
                  <th className="px-4 py-4 text-body-2">Currency</th>
                </tr>
                </thead>
                <tbody>
                {mandates ? mandates.map(mandate => {
                  return (
                    <tr key={mandate.id} onClick={() => selectMandate(mandate.id)} className={"border-t border-border cursor-pointer" + (selectedMandateId === mandate.id ? ' bg-border' : '')}>
                      <td className="w-full px-4 py-2">
                        {mandate.description}
                      </td>
                      <td className="px-4 py-2 leading-tight">
                        <div className="text-headline-5 text-right">
                          {formatCurrency(mandate.balance, mandate.assetScale)}
                        </div>
                        <div className="text-overline text-right text-on-surface-disabled">
                          /{formatCurrency(mandate.amount, mandate.assetScale)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-body-2">
                        {mandate.interval}
                      </td>
                      <td className="px-4 py-2 text-body-2">
                        {mandate.assetCode}
                      </td>
                    </tr>
                  )
                }) : null}
                </tbody>
              </table>
            </Card>
          </div>
          <div className="flex h-full w-1/3 ml-12">
            {sideBar(mandates.filter(mandate => mandate.id === selectedMandateId)[0],token)}
          </div>
        </div>
      </Content>

    </div>
  )
}

Mandates.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  const mandates: Array<Mandate> = [
    {
      id: '123',
      name: '//123',
      description: "ILP Flix Subscription",
      assetCode: "USD",
      assetScale: 6,
      amount: 10000000,
      balance: 0,
      startAt: '2019-01-01',
      scope: "$paymentPointer"
    },
    {
      id: '321',
      name: '//321',
      description: "Coil Tipping",
      assetCode: "USD",
      assetScale: 6,
      amount: 10000000,
      balance: 4999999,
      startAt: '2019-01-01',
      scope: "$paymentPointer"
    },
    {
      id: '231',
      name: '//231',
      description: "Random Org",
      assetCode: "USD",
      assetScale: 6,
      amount: 10000000,
      balance: 10000000,
      startAt: '2019-01-01',
      scope: "$paymentPointer"
    }
  ]

  return {
    mandates,
    token: user.token
  }
}

export default Mandates
