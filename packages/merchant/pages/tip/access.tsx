import React from 'react'
import Layout from '../../src/Layout'
import {NextPage} from "next"

const Page: NextPage = () => {

  return (
    <Layout title="ILP Overflow Access Token">
      <div className="max-w-xl flex flex-col shadow-lg rounded-lg bg-white mx-auto px-16 py-16 mt-16 mb-16">
        First get an access Token for tipping
      </div>
    </Layout>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {}
}

export default Page
