import React, { useState, Component } from 'react'
import Select from 'react-select'
import { NextPage } from "next"
import { Card, Content, Navigation, TextInput } from '../components'
// import "../styles/main.css";

const listline =
  <div className="border-t border-color-gray h-18 flex flex-row listline-div"> {/* having trouble setting colour of border */}
    <div className="flex flex-col">
      <img className="listline-img" src="http://placecorgi.com/79/79" />
    </div>
    <div className="flex flex-col listline-name-div">
      <div className="listline-name">Bob's Burgers</div>
    </div>
    <div className="flex flex-col listline-values">
      <div className="flex h-10 self-end w-card justify-around">
        <div>400.00/1200.00</div>
        <div>Monthly</div>
        <div>XRP</div>
      </div>
    </div>
  </div>

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
]

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
                      <TextInput name='searchFor' label='Search' style={{ position: 'relative', height: '72px'}}></TextInput>
                    </div>
                  </form>
                </div>
              </div>
              <div className='w-1/4 h-full bg-surface'>
                <Select options={options}           styles={customStyles}/>
              </div>
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col bg-surface-elevation-1 elevation-1 rounded text-on-surface">
                <div className="flex h-10 self-end">
                  <div className="flex justify-around w-card">
                    <div>Balance</div>
                    <div>Interval</div>
                    <div>Currency</div>
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
