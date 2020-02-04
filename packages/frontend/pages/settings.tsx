import React, { useState } from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation } from '../components'

const Settings: NextPage = () => {
  return (
    <div className="flex">
      <Navigation active="settings"></Navigation>
      <Content navigation>
        <Card>
          $ 123 456 789.0
        </Card>
      </Content>
    </div>
  )
}

export default Settings
