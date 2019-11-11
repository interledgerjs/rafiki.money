import * as React from 'react'
// import Link from 'next/link'
import Head from 'next/head'
import './index.css'
type LayoutProps = {
  title?: string
}
const layoutStyle = {
  background: '#efefef',
  width: '100vw',
  height: '100vh'
}
const Layout: React.FunctionComponent<LayoutProps> = ({ children, title }) => (
  <div style={layoutStyle}>
    <style jsx global>{`
      html { 
        background: #efefef
      }
      p {
        margin-bottom: 1rem
      }
    `}</style>
    <Head>
      <meta charSet="utf-8" />
      <link rel="shortcut icon" href="static/favicon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <title>ILP Merchant {title ? '-' + title : ''}</title>
    </Head>
    {children}
  </div>
)
export default Layout
