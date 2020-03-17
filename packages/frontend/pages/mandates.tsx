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
import { MandateTransaction } from '../../backend/src/models/mandateTransaction'


// import "../styles/main.css";

// link state to rafiki api
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
          onClick={() => selectMandate(mandate)}>
          <div className="flex flex-col">
            <img className="listline-img" src="http://placecorgi.com/79/79" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="listline-name">{mandate.description}</div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex self-end w-listTable justify-around
              items-center">
              <div className="w-5/12 pr-5">
                <div className="text-3xl leading-none text-right">
                  {mandate.balance}
                </div>
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

const months: Array<string> = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

const getTransactionCardDate = (DBString: string) => {
  const date = new Date(Date.parse(DBString))
  return (
    date.getDate() + ' ' +
    months[(date.getMonth() + 1)] + ' ' +
    date.getFullYear()
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
                  <div className="headline-6">
                    {getTransactionCardDate(transaction.createdAt)}
                  </div>
                </div>
                <div className="self-center headline-6 text-green">
                  {Number(transaction.amount)}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    })
  )
}

const makeMinLenTwo = (input: number) => {
  const string = input.toString()
  if (string.length === 1)
    return '0' + string
  else
    return string
}

const getDateBoxDateString = (DBString: string) => {
  const date = new Date(Date.parse(DBString))
  const rawArray = [
    date.getDate(),
    (date.getMonth() + 1),
    date.getFullYear(),
    date.getHours(),
    date.getMinutes()
  ]
  const finalArray = rawArray.map(makeMinLenTwo)
  return (
    finalArray[0] + '-' +
    finalArray[1] + '-' +
    finalArray[2] + ', ' +
    finalArray[3] + ':' +
    finalArray[4]
  )
}

const DateBox = ({ selectedMandate }) => {
  const startDate = getDateBoxDateString(selectedMandate.startAt)
  const expiryDate = getDateBoxDateString(selectedMandate.expireAt)

  return (
    <div className="mt-16 body-2">
      <div className="flex flex-row justify-between">
        <div className="">Created</div>
        <div className="">{startDate}</div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="">Expires</div>
        <div className="">{expiryDate}</div>
      </div>
    </div>
  )
}

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

const SidePanelInner = ({
  selectedMandateTransactionArray, selectedMandate
}) => {
  if (selectedMandate) {
    return (
      <div>
        <WholeDoughnut />
        <DateBox selectedMandate={selectedMandate} />
        <div className="mt-10 headline-6">Transactions</div>
        <TransactionCard
          selectedMandateTransactionArray={selectedMandateTransactionArray} />
      </div>
    )
  } else return (<div />)
}

const SidePanel = ({ selectedMandateTransactionArray, selectedMandate }) => (
  <div className="ml-8">
    <div className="p-4 bg-surface-elevation-1 elevation-1 rounded
        text-on-surface sm:max-w-full md:w-card h-full">
      <SidePanelInner
        selectedMandateTransactionArray={selectedMandateTransactionArray}
        selectedMandate={selectedMandate} />
    </div>
  </div>
)

const TextInputBox = () => (
  <div className='w-full h-full bg-surface'>
    <div className='w-full max-w-xs bg-surface flex items-center'>
      <form className='w-full max-w-xs'>
        <div className=''>
          <TextInput name='searchFor' label='Search' style={{
            position: 'relative', height: '72px'
          }} />
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
    <div className="flex flex-col bg-surface-elevation-1 elevation-1 rounded
      text-on-surface">
      <div className="flex h-10 self-end">
        <div className="flex justify-around w-listTable">
          <div className="w-5/12">Balance</div>
          <div className="w-1/3">Interval</div>
          <div className="w-1/4">Currency</div>
        </div>
      </div>
      <Listline
        mandateArray={mandateArray}
        selectMandate={selectMandate} />
    </div>
  </div>
)

const MainView = ({ mandateArray, selectMandate }) => (
  <div className="flex flex-col">
    <TopRow />
    <List
      mandateArray={mandateArray}
      selectMandate={selectMandate} />
  </div>
)

const Account: NextPage<Props> = (props) => {
  const [mandateArray] = useState(props.mandateArray)

  const [selectedMandate, setSelectedMandate]: [Mandate, any] = useState()

  const [selectedMandateTransactionArray, setSelectedMandateTransactionArray]:
    [Array<MandateTransaction>, any] = useState()

  const selectMandate = async (mandate: Mandate) => {
    await setSelectedMandateTransactionArray(
      await MandatesService().getMandatesByMandateId(
        props.user.token, mandate.id))
    await setSelectedMandate(mandate)
  }

  return (
    <div className="flex flex-grow">
      <Navigation active="mandates"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <MainView
            mandateArray={mandateArray}
            selectMandate={selectMandate} />
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
  const mandateArray: Mandate[] =
    await MandatesService().getMandates(user.token)
  return { user, mandateArray }
}

export default Account
