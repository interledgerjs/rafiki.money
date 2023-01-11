import React, {FC} from 'react'
import App from 'next/app'
import '../styles/main.css'
import Head from 'next/head'

const Banner: FC = () => (<div className="fixed flex justify-center items-center bg-red text-white w-full p-1">
   We're working hard on building a new testing and development environemt based on &nbsp;<a href="https://github.com/interledger/rafiki">Rafiki</a>&nbsp; and the &nbsp;<a href="https://docs.openpayments.guide/">Open Payments APIs</a>.
</div>)

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <title>Rafiki Money</title>
        </Head>
        <Banner/>
        <Component {...pageProps} />
      </>
    )
  }
}

export default MyApp
