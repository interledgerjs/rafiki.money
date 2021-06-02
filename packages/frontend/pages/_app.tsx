import React, {FC} from 'react'
import App from 'next/app'
import '../styles/main.css'
import Head from 'next/head'

const Banner: FC = () => (<div className="fixed flex justify-center items-center bg-error text-white w-full h-8">This site is for demo purposes only.</div>)

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
