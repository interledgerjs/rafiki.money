import React from 'react'
import App from 'next/app'
import '../styles/main.css'
import Head from 'next/head'

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <>
        <Head>
          <title>Rafiki Money</title>
        </Head>
        <Component {...pageProps} />
      </>
    )
  }
}

export default MyApp
