import React from 'react'
import {NextPage} from "next";

const Page: NextPage = () => {

  return (
   <div>
     Gatehub Test
   </div>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {}
}

export default Page
