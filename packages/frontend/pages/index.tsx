import React, {useState, useEffect} from 'react'
import { NextPage } from 'next'
import { parseCookies } from 'nookies'
import { UsersService } from '../services/users'
import { Button, Logo } from '../components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

const usersService = UsersService()

const Home: NextPage = () => {

  useEffect(() => {
  })

  const router = useRouter()
  return (
    <div className="flex w-full h-screen">
      <div className="mx-auto my-auto text-center">
        <div className="flex justify-center">
          <Logo height={250}/>
        </div>
        <div className="text-on-surface headline-3">
          Welcome to Rafiki money!
        </div>
        <div className="text-on-surface body-1 max-w-xs mx-auto mt-6">
          Sign up to create an account, or login if you’re returning
        </div>
        <div className="flex flex-row justify-center mt-8">
          <Button type="text" className="mr-4" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button type="solid" onClick={() => router.push('/signup')}>
            Signup
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home

Home.getInitialProps = async (ctx) => {
//   const cookies = parseCookies(ctx)

  // TODO add check if logged in and default to overview page
  // try {
  //   if(cookies && cookies.token) {
  //     const user = await usersService.getUser(cookies.token)
  //     console.log(user)
  //   } else {
  //     throw new Error('no token')
  //   }
  // } catch(error) {
  //   // if (typeof window === 'undefined') {
  //   //   ctx.res.writeHead(302, {
  //   //     Location: '/login'
  //   //   }).end()
  //   //   return
  //   // }
  //   //
  //   // window.location.href = '/login'
  // }
  ctx.res.setHeader('link', "<http://localhost:3000/payment-manifest.json>; rel=\"payment-method-manifest\"")

  return {}
}
