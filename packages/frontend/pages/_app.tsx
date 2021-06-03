import React, {FC} from 'react'
import App from 'next/app'
import '../styles/main.css'
import Head from 'next/head'

const Banner: FC = () => (<div className="fixed flex justify-center items-center bg-purple text-white w-full p-1">
    You are using an environment for testing and development purposes only - all money is illustrative and not real.
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
