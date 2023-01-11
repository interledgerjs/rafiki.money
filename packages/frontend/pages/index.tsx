import React, {useEffect} from 'react'
import { NextPage } from 'next'
import { UsersService } from '../services/users'
import { Logo } from '../components'
// import Link from 'next/link'
// import { useRouter } from 'next/router'
// import Head from 'next/head'

const usersService = UsersService()

const Home: NextPage = () => {

  useEffect(() => {
  })

  // const router = useRouter()
  return (
    <div className="flex w-full h-screen">
      <div className="mx-auto my-auto text-center">
        <div className="flex justify-center">
          <Logo height={200}/>
        </div>
        <div className="text-on-surface headline-4 max-w-xs">
          Welcome to
        </div>
        <div className="text-on-surface headline-3 max-w-xs">
          Rafiki Money!
        </div>
        <div className="text-on-surface body-1 max-w-xs mx-auto mt-6">
          We've deprecated this service, and are working on building a new version of an Interledger testnet. Please check back later in 2023 for a preview.
        </div>
      </div>
    </div>
  )
}

export default Home

Home.getInitialProps = async (ctx) => {
  return {}
}
