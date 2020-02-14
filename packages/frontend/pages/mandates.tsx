import React, { useState, Component } from 'react'
import Select from 'react-select'
import { NextPage } from "next"
import { Card, Content, Navigation, TextInput } from '../components'
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
      <div className="flex self-end w-listTable justify-around">
        <div className="w-5/12">
          <div className="text-3xl leading-none">400.00</div>
          <div className="text-xs flex justify-end">/1200.00</div>
        </div>
        <div className="w-1/3">Monthly</div>
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
};

const Account: NextPage = () => {
  return (
    <div className="flex flex-grow">
      <Navigation active="mandates"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <div className="flex flex-col">
            <div className="flex flex-row justify-between">
              <div className='w-full h-full bg-surface'>
                <div className='w-full max-w-xs bg-surface flex items-center'>
                  <form className='w-full max-w-xs'>
                    <div className=''>
                      <TextInput name='searchFor' label='Search' style={{ position: 'relative', height: '72px' }}></TextInput>
                    </div>
                  </form>
                </div>
              </div>
              <div className='w-1/4 h-full bg-surface'>
                <Select options={options} styles={customStyles} />
              </div>
            </div>
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
          </div>
          <div className="flex flex-col bg-surface-elevation-1 elevation-1 rounded text-on-surface content-div">
            COOOOONTEEENT
        </div>
        </div>
      </Content>
    </div>
  )
}

export default Account
