/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useState, Component } from 'react'
import Select from 'react-select'
import { NextPage } from 'next'
import { Card, Content, Navigation, TextInput } from '../components'
import { Doughnut } from 'react-chartjs-2'
import { MandatesService } from '../services/mandates'
import { checkUser } from '../utils'
import { defaultProps } from 'react-select/src/Select'
import { Mandate } from '../../backend/src/models/mandate'


// import "../styles/main.css";

// link state to rafiki api
// -implement test call from mandates page to api
// -implement remainder of calls and make data live
// make transaction list scrollable
// make doughnut ratio reactive
// refine the way components display
// re-enable linting rules (top of file)

type MandateJSON = {
  id: string
  description: string
  assetCode: string
  assetScale?: number
  amount: string
  balance: string
  startAt: string
  expireAt: string
  interval: string
  cap?: boolean
  scope?: string
}

type TransactionJSON = {
  id: number,
  accountId?: number,
  description?: string,
  amount: bigint,
  createdAt: string,
  updatedAt?: string
}

const bb1TransactionArray: Array<TransactionJSON> = [
  {
    id: 3061111,
    createdAt: 'date of bb1 t1',
    amount: BigInt(11)
  }, {
    id: 3061112,
    createdAt: 'date of bb1 t2',
    amount: BigInt(12)
  }, {
    id: 3061113,
    createdAt: 'date of bb1 t3',
    amount: BigInt(13)
  }
]

const bb2TransactionArray: Array<TransactionJSON> = [
  {
    id: 3061114,
    createdAt: 'date of bb2 t1',
    amount: BigInt(21)
  }, {
    id: 3061115,
    createdAt: 'date of bb2 t2',
    amount: BigInt(22)
  }, {
    id: 3061116,
    createdAt: 'date of bb2 t3',
    amount: BigInt(23)
  }
]

const bb3TransactionArray: Array<TransactionJSON> = [
  {
    id: 3061117,
    createdAt: 'date of bb3 t1',
    amount: BigInt(31)
  }, {
    id: 3061118,
    createdAt: 'date of bb3 t2',
    amount: BigInt(32)
  }, {
    id: 3061119,
    createdAt: 'date of bb3 t3',
    amount: BigInt(33)
  }
]

// this specifies the content of the selector
const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

// allows custom styling of selector
const customStyles = {
  control: base => ({
    ...base,
    height: 56,
    minHeight: 56
  })
}

const data = {
  labels: ['Used', 'Available'],
  datasets: [
    {
      data: [300, 500],
      backgroundColor: ['#FF8A65', '#21D2BF'],
      hoverBackgroundColor: ['#FF8A65', '#21D2BF'],
      borderWidth: 0
    }
  ]
}

const doughnutOptions = {
  cutoutPercentage: 64,
  elements: {
    center: {
      text: 'Desktop',
      color: '#36A2EB', // Default black
      fontStyle: 'Helvetica', // Default Arial
      sidePadding: 20 // Default 20 (as a percentage)
    }
  }
}

const Listline = ({ mandateArray, selectMandate }) => {
  return (
    mandateArray.map(mandate => {
      return (
        <div
          key={mandate.id}
          className="border-t border-color-gray h-18 flex flex-row listline-div"
          onClick={() => selectMandate(mandate)}> {/* having trouble setting colour of border */}
          <div className="flex flex-col">
            <img className="listline-img" src="http://placecorgi.com/79/79" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="listline-name">{mandate.description}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex self-end w-listTable justify-around items-center">
              <div className="w-5/12 pr-5">
                <div className="text-3xl leading-none text-right">{mandate.balance}</div>
                <div className="text-xs text-right">/{mandate.amount}</div>
              </div>
              <div className="w-1/3">{mandate.interval}</div>
              <div className="w-1/4">{mandate.assetCode}</div>
            </div>
          </div>
        </div>
      )
    })
  )
}

const TransactionCard = ({ selectedMandateTransactionArray }) => {
  return (
    selectedMandateTransactionArray.map(transaction => {
      return (
        <div key={transaction.id} className="flex flex-col">
          <div className="my-2">
            <Card>
              <div className="flex justify-between">
                <div>
                  <div className="headline-6">{transaction.createdAt}</div>
                </div>
                <div className="self-center headline-6 text-green">{Number(transaction.amount)}</div>
              </div>
            </Card>
          </div>
        </div>
      )
    })
  )
}

const DateBox = ({ selectedMandate }) => (
  <div className="mt-16 body-2">
    <div className="flex flex-row justify-between">
      <div className="">Created</div>
      <div className="">{selectedMandate.startAt}</div>
    </div>
    <div className="flex flex-row justify-between">
      <div className="">Expires</div>
      <div className="">{selectedMandate.expireAt}</div>
    </div>
  </div>
)

const DoughnutInner = () => (
  <div className="donut-inner">
    <span className="donut-inner-used">Used<br /></span>
    <span className="donut-inner-available">Available</span>
  </div>
)

const DoughnutDisplay = () => (
  <Doughnut
    data={data}
    options={doughnutOptions}
    width={170}
    legend={{
      position: 'bottom',
      display: false,
      align: 'centre',
      labels: {
        fontColor: '#FF8A65',
        usePointStyle: true
      }
    }}
  />
)

const WholeDoughnut = () => (
  <div className="h-64">
    {/* <div>help</div> */}
    <DoughnutDisplay />
    <DoughnutInner />
  </div>
)

const SidePanel = ({ selectedMandateTransactionArray, selectedMandate }) => (
  <div className="ml-8">
    <div className="p-4 bg-surface-elevation-1 elevation-1 rounded text-on-surface sm:max-w-full md:w-card h-full">
      <WholeDoughnut />
      <DateBox selectedMandate={selectedMandate} />
      <div className="mt-10 headline-6">Transactions</div>
      <TransactionCard selectedMandateTransactionArray={selectedMandateTransactionArray} />
    </div>
  </div>
)

const TextInputBox = () => (
  <div className='w-full h-full bg-surface'>
    <div className='w-full max-w-xs bg-surface flex items-center'>
      <form className='w-full max-w-xs'>
        <div className=''>
          <TextInput name='searchFor' label='Search' style={{ position: 'relative', height: '72px' }}></TextInput>
        </div>
      </form>
    </div>
  </div>
)

const Selector = () => (
  <div className='w-1/4 h-full bg-surface'>
    <Select options={options} styles={customStyles} />
  </div>
)

const TopRow = () => (
  <div className="flex flex-row justify-between">
    <TextInputBox />
    <Selector />
  </div>
)

const List = ({ mandateArray, selectMandate }) => (
  <div className="flex flex-row">
    <div className="flex flex-col bg-surface-elevation-1 elevation-1 rounded text-on-surface">
      <div className="flex h-10 self-end">
        <div className="flex justify-around w-listTable">
          <div className="w-5/12">Balance</div>
          <div className="w-1/3">Interval</div>
          <div className="w-1/4">Currency</div>
        </div>
      </div>
      <Listline
        mandateArray={mandateArray}
        selectMandate={selectMandate}/>
    </div>
  </div>
)

const MainView = ({ mandateArray, selectMandate }) => (
  <div className="flex flex-col">
    <TopRow />
    <List
      mandateArray={mandateArray}
      selectMandate={selectMandate}/>
  </div>
)

const Account: NextPage<Props> = (props) => {
  const [mandateArray] = useState(props.mandateArray)

  const [selectedMandate, setSelectedMandate]: [Mandate, any] = useState(props.mandateArray[0])

  const [selectedMandateTransactionArray, setSelectedMandateTransactionArray] = useState(bb1TransactionArray)

  const selectMandate = (mandate: Mandate) => {
    setSelectedMandate(mandate)
    setSelectedMandateTransactionArray(() => {
      const i = Math.floor(Math.random() * Math.floor(3))
      switch (i) {
        case 0:
          return (bb1TransactionArray)
        case 1:
          return (bb2TransactionArray)
        case 2:
          return (bb3TransactionArray)
      }
    })
  }

  return (
    <div className="flex flex-grow">
      <Navigation active="mandates"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <MainView
            mandateArray={mandateArray}
            selectMandate={selectMandate}/>
          <SidePanel
            selectedMandateTransactionArray={selectedMandateTransactionArray}
            selectedMandate={selectedMandate} />
        </div>
      </Content>
    </div>
  )
}

type Props = {
  user: {
    id: number,
    username: string,
    defaultAccountId: string,
    token: string
  },
  mandateArray: Mandate[]
}

Account.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)
  const mandateArray = await MandatesService().getMandates(user.token)
  console.log(mandateArray)

  return { user, mandateArray }
}

export default Account
