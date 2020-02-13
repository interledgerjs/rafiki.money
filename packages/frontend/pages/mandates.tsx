import React, { useState } from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation } from '../components'
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


const Account: NextPage = () => {
  return (
    <div className="flex flex-grow">
      <Navigation active="mandates"></Navigation>
      <Content navigation>
        <div className="flex flex-row h-full">
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Card >Seearch</Card> {/* className="flex flex-col search-div" */}
              <div className="flex flex-col drop-div">Drroooopdin</div>
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
