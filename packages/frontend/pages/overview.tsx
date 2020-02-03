import React, { useState } from 'react'
import { NextPage } from "next"
import Navigation from '../components/navigation'
import Content from '../components/content'
import Card from '../components/card'

const Sandbox: NextPage = () => {
  return (
    <div className="flex">
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <Card>
          $ 123 456 789.0
        </Card>
      </Content>
    </div>
  )
}

export default Sandbox
