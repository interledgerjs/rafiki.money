import React from 'react'
import { NextPage } from 'next'


const Home: NextPage = () => {
  return (
    null
  )
}

export default Home

Home.getInitialProps = async (ctx) => {
  ctx.res.end()
  return {}
}
