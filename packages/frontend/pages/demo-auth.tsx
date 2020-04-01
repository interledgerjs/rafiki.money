import React from 'react'
import { NextPage } from "next"
import { Card, Content, Navigation } from '../components'
import { checkUser } from '../utils'

type Props = {
  user: {
    id: number,
    username: string,
    defaultAccountId: string,
    token: string
  }
}

const Page: NextPage<Props> = (props) => {
  return (
    <div className="flex">
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <Card>
          {props.user.token}
        </Card>
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
