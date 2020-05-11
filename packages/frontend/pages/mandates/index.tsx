import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation, Selector } from '../../components'
import { checkUser, formatCurrency } from '../../utils'
import { DonutChart } from '../../components/donutChart'
import Modal from 'react-modal'
import { MandatesService } from '../../services/mandates'
import { useRouter } from 'next/router'
import { parse, toSeconds } from 'iso8601-duration'
import moment from 'moment'

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
  accountName?: string,
  nextIntervalStartAt?: string,
  scope: string
}

type Props = {
  mandates?: Array<Mandate>
  token: string
}

const mandateStates = [
  {
    value: 'active',
    label: 'Active'
  },
  {
    value: 'expired',
    label: 'Expired'
  },
  {
    value: 'cancelled',
    label: 'Cancelled'
  }
]

const humanizeInterval = (interval: string): string => {
  let output = ''
  const parsedInterval = parse(interval)

  if(parsedInterval.weeks !== 0) {
    return `${parsedInterval.weeks} ${parsedInterval.days === 1 ? 'Week' : 'Weeks'}`
  }
  if(parsedInterval.years !== 0) {
    return `${parsedInterval.years} ${parsedInterval.years === 1 ? 'Year' : 'Years'}`
  }
  if(parsedInterval.months !== 0) {
    return `${parsedInterval.months} ${parsedInterval.months === 1 ? 'Month' : 'Months'}`
  }
  if(parsedInterval.days !== 0) {
    return `${parsedInterval.days} ${parsedInterval.days === 1 ? 'Day' : 'Days'}`
  }
  if(parsedInterval.hours !== 0) {
    return `${parsedInterval.hours} ${parsedInterval.hours === 1 ? 'Hour' : 'Hours'}`
  }
  if(parsedInterval.minutes !== 0) {
    return `${parsedInterval.days} ${parsedInterval.minutes === 1 ? 'Minute' : 'Minutes'}`
  }
  if(parsedInterval.seconds !== 0) {
    return `${parsedInterval.days} ${parsedInterval.seconds === 1 ? 'Second' : 'Seconds'}`
  }

}

const mandatesService = MandatesService()

const sideBar = (mandateId: string, token, openModal) => {
  const [mandate, setMandate] = useState<Mandate>()
  const [transactions, setTransactions] = useState([])

  const getTransactions = () => {
    mandatesService.getTransactionsByMandateId(token, mandateId).then(transactions => {
      setTransactions(transactions)
    })
  }

  const getMandate = () => {
    mandatesService.getUserMandateById(mandateId, token).then(mandate => {
      console.log(mandate)
      setMandate(mandate)
    })
  }

  useEffect(() => {
    if(mandateId) {
      getMandate()
      getTransactions()
    }
  }, [mandateId])

  const formatDate = (date: string) => {
    const jsDate = new Date(date)
    return jsDate.getDate() + '-' + jsDate.getMonth() + '-' + jsDate.getUTCFullYear()
  }

  if(mandate) {
    return (
      <Card width="w-full" className="flex flex-col overflow-y-auto">
        <div className="flex justify-end">
          <Button onClick={openModal} type="text" textColour="red">
            Cancel
          </Button>
        </div>
        <div>
          <DonutChart
            available={Number(formatCurrency(mandate.balance,mandate.assetScale))}
            used={Number(formatCurrency(mandate.amount - mandate.balance,mandate.assetScale))}
          />
        </div>
        <div className="my-8">
          <div className="flex justify-between">
            <div className="text-body-2">
              Created
            </div>
            <div className="text-body-2">
              {moment(mandate.startAt).format('DD MMM YYYY')}
            </div>
          </div>
          {
            mandate.nextIntervalStartAt ?
              <div className="flex justify-between">
                <div className="text-body-2">
                  Next Interval
                </div>
                <div className="text-body-2">
                  {moment(mandate.nextIntervalStartAt).format('DD MMM YYYY')}
                </div>
              </div>
              : null
          }
          <div className="flex justify-between">
            <div className="text-body-2">
              Account
            </div>
            <div className="text-body-2">
              {mandate.accountName}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-headline-6">
            Transactions
          </div>
          <div>
            {
              transactions.map(transaction => {
                return (
                  <div key={transaction.id} className="flex w-full my-4 py-2 px-2 border border-border rounded">
                    <div className="leading-tight my-auto">
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
  const router = useRouter()

  const [localMandates, setLocalMandates] = useState<Array<Mandate>>(mandates)
  const [selectedMandateId, setSelectedMandateId] = useState<string>()
  const [modalIsOpen,setIsOpen] = React.useState(false);
  const [mandatesSelectedState, setMandatesSelectedState] = useState(mandateStates[0])

  const openModal = () => {
    setIsOpen(true)
  }

  useEffect(() => {
    getMandates()
  }, [mandatesSelectedState])

  const getMandates = async () => {
    const mandates = await mandatesService.getUserMandates(mandatesSelectedState.value, token)
    setLocalMandates(mandates)
    setSelectedMandateId('')
  }

  function closeModal(){
    setIsOpen(false);
  }

  const selectMandate = (id: string) => {
    setSelectedMandateId(id)
  }

  const setMandatesState = (option) => {
    setMandatesSelectedState(option)
  }

  const cancelMandate = (mandateId: string) => {
    mandatesService.cancelMandate(mandateId, token).then(() => {
      getMandates()
      closeModal()
    })
  }

  return (
    <div>
      <Navigation active="mandates"/>
      <Content navigation>
        <div className="flex flex-col sm:flex-row h-full w-full sm:w-full">
          <div className="w-full sm:w-2/3 flex flex-col">
            <div className="flex justify-end">
              <div className="w-48">
                <Selector options={mandateStates} defaultValue={mandateStates[0]} onChange={setMandatesState}/>
              </div>
            </div>
            <div className="flex sm:hidden mb-8 justify-between">
              <div className="text-headline-6 my-auto text-on-surface">
                Mandates
              </div>
            </div>
            <div className="flex flex-col sm:hidden w-full">
              {localMandates ? localMandates.map(mandate => {
                  return (
                    <div onClick={() => console.log(`Route to mandates page: ${mandate.id}`)}>
                    {/* <div onClick={() => router.push(`/mandates/${mandate.id}`)}> */}
                      <Card key={mandate.id}  className="flex flex-row flex-wrap cursor-pointer mb-8">
                        <div className="w-full px-4 py-2 text-headline-5">
                          {mandate.description}
                        </div>
                        <div className="px-4 py-2 w-1/3 text-headline-6">
                          {mandate.assetCode}
                        </div>
                        <div className="px-4 py-2 w-2/3 leading-tight">
                          <div className="text-headline-5 text-right">
                            {formatCurrency(mandate.balance, mandate.assetScale)}
                          </div>
                          <div className="text-overline text-right text-on-surface-disabled">
                            /{formatCurrency(mandate.amount, mandate.assetScale)}
                          </div>
                        </div>
                        <div className="px-4 py-2 text-body-2 w-full text-right">
                          {mandate.interval}
                        </div>
                        
                      </Card>
                    </div>
                  )
                }) : null}
            </div>
            <Card width="w-full" className="mt-8 px-0 pt-0 pb-0 hidden sm:flex">
              <table className="w-full">
                <thead>
                <tr>
                  <th className="px-4 py-4"></th>
                  <th className="px-4 py-4 text-body-2 text-right">Amount</th>
                  <th className="px-4 py-4 text-body-2">Interval</th>
                  <th className="px-4 py-4 text-body-2">Currency</th>
                </tr>
                </thead>
                <tbody>
                {localMandates ? localMandates.map(mandate => {
                  return (
                    <tr key={mandate.id} onClick={() => selectMandate(mandate.id)} className={"border-t border-border cursor-pointer" + (selectedMandateId === mandate.id ? ' bg-border' : '')}>
                      <td className="w-full px-4 py-2">
                        {mandate.description}
                      </td>
                      <td className="px-4 py-2 leading-tight">
                        <div className="text-headline-5 text-right">
                          {formatCurrency(mandate.amount, mandate.assetScale)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-body-2">
                        {mandate.interval ? humanizeInterval(mandate.interval) : null}
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
          <div className="hidden sm:flex h-full w-1/3 ml-12">
            {sideBar(selectedMandateId, token, openModal)}
          </div>
        </div>
      </Content>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={{
          overlay: {
            backgroundColor: 'var(--color-modal-background)'
          },
          content : {
            backgroundColor       : 'var(--color-surface-elevation-24)',
            border                : 'none',
            top                   : '50%',
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-50%',
            transform             : 'translate(-50%, -50%)'
          }
        }}
      >
        <div className="max-w-xs w-full text-on-surface flex flex-col">
          <div className="headline-6">
            Cancel Mandate?
          </div>
          <div className="body-1 my-6">
            By cancelling this mandate you will no longer allow the holder to debit your account.
          </div>
          <div className="flex justify-end">
            <Button type='text' className="mr-2" onClick={closeModal}>
              Disagree
            </Button>
            <Button type='text' onClick={() => cancelMandate(selectedMandateId)}>
              Agree
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

Mandates.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  const mandates = await mandatesService.getUserMandates('active', user.token)

  // const mandates: Array<Mandate> = [
  //   {
  //     id: '123',
  //     name: '//123',
  //     description: "ILP Flix Subscription",
  //     assetCode: "USD",
  //     assetScale: 6,
  //     amount: 10000000,
  //     balance: 0,
  //     startAt: '2019-01-01',
  //     scope: "$paymentPointer"
  //   },
  //   {
  //     id: '321',
  //     name: '//321',
  //     description: "Coil Tipping",
  //     assetCode: "USD",
  //     assetScale: 6,
  //     amount: 10000000,
  //     balance: 4999999,
  //     startAt: '2019-01-01',
  //     scope: "$paymentPointer"
  //   },
  //   {
  //     id: '231',
  //     name: '//231',
  //     description: "Random Org",
  //     assetCode: "USD",
  //     assetScale: 6,
  //     amount: 10000000,
  //     balance: 10000000,
  //     startAt: '2019-01-01',
  //     scope: "$paymentPointer"
  //   }
  // ]

  return {
    mandates,
    token: user.token
  }
}

export default Mandates
