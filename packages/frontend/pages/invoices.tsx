import React, { useState } from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation } from '../components'

type Invoice = {
  id: string,
  amount: number,
  received: number,

}

type Props = {
  invoices?: Array<Invoice>
}

const Invoices: NextPage<Props> = ({invoices}) => {
  return (
    <div className="flex">
      <Navigation active="invoice"></Navigation>
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
            <table className="mt-8 w-full bg-surface-elevation-1 elevation-1 rounded text-on-surface h-24">
              <thead>
              <tr>
                <th className="px-4 py-2 text-right">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Views</th>
              </tr>
              </thead>
              <tbody>
              {invoices ? invoices.map(invoice => {
                return (
                  <tr className="">
                    <td className="px-4 py-2">Intro to CSS</td>
                    <td className="px-4 py-2">Adam</td>
                    <td className="px-4 py-2">858</td>
                  </tr>
                )
              }) : null}
              </tbody>
            </table>
          </div>
          <div className="h-full w-1/3 flex">
            <div className="mx-auto">
              <Card>
                Select an Invoice
              </Card>
            </div>

          </div>
        </div>



      </Content>
    </div>
  )
}

Invoices.getInitialProps = async ({query, res}) => {

  const invoices: Array<Invoice> = [
    {
      id: '123',
      amount: 100,
      received: 0
    },
    {
      id: '3212',
      amount: 100,
      received: 0
    },
    {
      id: '541321',
      amount: 100,
      received: 0
    }
  ]

  return {
    invoices
  }
}

export default Invoices
