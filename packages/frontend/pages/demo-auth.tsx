import React from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation } from '../components'
import { checkUser } from '../utils'

const Page: NextPage = () => {
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

export default Page

Page.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  return { user }
}
