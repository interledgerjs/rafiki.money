// import React, { useState, Component } from 'react'
import React from 'react'
import Select from 'react-select'
import { NextPage } from 'next'
import { Card, Content, Navigation, TextInput } from '../components'
import { Doughnut } from 'react-chartjs-2'

// import "../styles/main.css";

// component with which to populate list
const listline =
  <div className="border-t border-color-gray h-18 flex flex-row listline-div"> {/* having trouble setting colour of border */}
    <div className="flex flex-col">
      <img className="listline-img" src="http://placecorgi.com/79/79" />
    </div>
    <div className="flex flex-col justify-center">
      <div className="listline-name">Bob's Burgers</div>
    </div>
    <div className="flex flex-col justify-center">
      <div className="flex self-end w-listTable justify-around items-center">
        <div className="w-5/12 pr-5">
          <div className="text-3xl leading-none text-right">400.00</div>
          <div className="text-xs text-right">/1200.00</div>
        </div>
        <div className="w-1/3">
          Monthly
        </div>
        <div className="w-1/4">XRP</div>
      </div>
    </div>
  </div>

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

class TransactionCard extends React.Component {
  render () {
    return (
      <div className="flex flex-col">
        {/* Transaction card functionally */}
        {/* {TransactionCard("Cheque", "16.00", "2 Feb 2020", false)} */}
        {/* Transaction card manually */}
        <div className="my-2">
          <Card>
            <div className="flex justify-between">
              <div>
                {/* <div className="overline text-blue">Savings</div> */}
                <div className="headline-6">1 Feb 2020</div>
              </div>
              <div className="self-center headline-6 text-green">
                $ 84.00
              </div>
            </div>
          </Card>
        </div>
        {/* {TransactionCard("Cheque", "100", "1 Feb 2020")}
  {TransactionCard("Cheque", "50.00", "1 Feb 2020", false)} */}
      </div>)
  }
}

class DateBox extends React.Component {
  render () {
    return (
      <div className="mt-16 body-2">
        <div className="flex flex-row justify-between">
          <div className="">Created</div>
          <div className="">31-01-2020, 10:13</div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="">Expires</div>
          <div className="">06-02-2020, 10:13</div>
        </div>
      </div>
    )
  }
}

class DoughnutInner extends React.Component {
  render () {
    return (
      <div className="donut-inner">
        <span className="donut-inner-used">Used<br /></span>
        <span className="donut-inner-available">Available</span>
      </div>
    )
  }
}

class DoughnutDisplay extends React.Component {
  render () {
    return (
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
  }
}

class WholeDoughnut extends React.Component {
  render () {
    return (
      <div className="h-64">
        {/* <div>help</div> */}
        <DoughnutDisplay />
        <DoughnutInner />
      </div>
    )
  }
}

class SidePanel extends React.Component {
  render () {
    return (
      /* Master Div */
      <div className="ml-8">
        {/* Graph Card */}
        <div className="p-4 bg-surface-elevation-1 elevation-1 rounded text-on-surface sm:max-w-full md:w-card h-full">
          <WholeDoughnut />
          <DateBox />
          {/* Headline */}
          <div className="mt-10 headline-6">Transactions</div>
          {/* Transactions master div */}
          <TransactionCard />
          <TransactionCard />
          <TransactionCard />
        </div>
      </div>
    )
  }
}

class TextInputBox extends React.Component {
  render () {
    return (
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
  }
}

class Selector extends React.Component {
  render () {
    return (
      <div className='w-1/4 h-full bg-surface'>
        <Select options={options} styles={customStyles} />
      </div>

    )
  }
}

class TopRow extends React.Component {
  render () {
    return (
      <div className="flex flex-row justify-between">
        <TextInputBox />
        <Selector />
      </div>
    )
  }
}

class List extends React.Component {
  render () {
    return (
      <div className="flex flex-row">
        <div className="flex flex-col bg-surface-elevation-1 elevation-1 rounded text-on-surface">
          <div className="flex h-10 self-end">
            <div className="flex justify-around w-listTable">
              <div className="w-5/12">Balance</div>
              <div className="w-1/3">Interval</div>
              <div className="w-1/4">Currency</div>
            </div>
          </div>
          {listline}
          {listline}
          {listline}
        </div>
      </div>
    )
  }
}

class MainView extends React.Component {
  render () {
    return (
      <div className="flex flex-col">
        <TopRow />
        <List />
      </div>
    )
  }
}

const Account: NextPage = () => {
  return (
    <div className="flex flex-grow">
      <Navigation active="mandates"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <MainView />
          <SidePanel />
        </div>
      </Content>
    </div>
  )
}

export default Account
