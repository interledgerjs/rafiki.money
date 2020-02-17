import React, { useState } from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation, Button, Selector } from '../components'

const Settings: NextPage = () => {
  return (
    <div className="flex">
      <Navigation active="settings"></Navigation>
      <Content navigation name="flex items-center justify-center">
        <div>
          <Card>
            cairin@coil.com
          <div className="flex justify-end">
              <Button textColour="error" type='text' buttonType='submit'>LOGOUT </Button>
            </div>
          </Card>
          <div className="pb-10"></div>
          <Card>
            <div className="text-headline-5 pb-10">
              Default account
            </div>
            <div className = "pb-10">
              <Selector></Selector>
            </div>
          </Card>
        </div>
      </Content>
    </div>
  )
}

export default Settings