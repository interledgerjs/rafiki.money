import React from 'react'
import Layout from '../src/Layout'
import {NextPage} from "next";

const Page: NextPage = () => {

  return (
    <Layout title="">
      <div className="w-full h-full flex-col">
        <div className="my-auto flex flex-col justify-center align-center h-1/3">
          <div className='w-full flex justify-center'>
            <img src='/static/logo_transparent.png' className='flex justify-center' alt="Demo ILP Merchant Logo" style={{height: '28rem'}}/>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="my-auto bg-white rounded shadow-lg flex cursor-pointer justify-center w-full md:w-1/5 h-32" onClick={() => { window.location.href = 'https://rafiki.money' }}>
              <div className="w-1/2 flex">
                <img className="" src="https://source.unsplash.com/chB-ff0cgCU/200x200"/>
              </div>
              <div className="p-4 md:text-lg">
                <p>You will need a Digital Wallet to purchase goods on this store.</p>
                <div className='mt-4'>
                  <a href='https://rafiki.money' className='text-grey-darkest font-bold'>Sign up</a>
                </div>
              </div>
          </div>
        </div>

        <div className="md:w-32 h-6 md:h-24"/>

        <div className="w-full flex justify-center">
          <div className="w-full md:flex md:justify-center my-auto">
            <div className="md:w-1/3 bg-white rounded shadow-lg flex cursor-pointer" onClick={() => { window.location.href = '/subscribe' }}>
              <div className="w-1/2 flex">
                <img className="" src="https://source.unsplash.com/WtllOYrN70E/400x400"/>
              </div>

              <div className="w-2/3 md:w-1/2 py-4 px-2 md:px-4 flex-col">
                <p className="capitalize text-grey-darkest font-bold md:text-2xl">Subscription Flow</p>
                <ul className="md:text-lg -ml-2 md:mt-4">
                  <li className='my-2'>Wallet registers payment handler</li>
                  <li className='my-2'>Merchant site uses Payment Request API</li>
                  <li className='my-2'>No payment pointer entered by user</li>
                  <li className='my-2'>Wallet creates mandate</li>
                  <li className='my-2'>User authorizes mandate through Oauth in payment handler UI</li>
                  <li className='my-2'>Payment handler redirects to merchant callback URL with Oauth grant</li>
                </ul>

                <div className='mt-4'>
                  <a href='/subscribe' className='text-grey-darkest font-bold'>View Demo</a>
                </div>
              </div>

            </div>

            <div className="md:w-32 h-8"/>

            <div className="md:w-1/3 bg-white rounded shadow-lg flex cursor-pointer" onClick={() => { window.location.href = '/checkout' }}>
              <div className="w-1/2 flex">
                <img className="" src="https://source.unsplash.com/qG37GMUDAJ0/400x400"/>
              </div>

              <div className="w-2/3 md:w-1/2 py-4 px-2 md:px-4 flex-col">
                <p className="capitalize text-grey-darkest font-bold md:text-2xl">Checkout flow</p>
                <ul className="md:text-lg -ml-2 md:mt-4">
                  <li className='my-2'>User enters payment pointer</li>
                  <li className='my-2'>Merchant creates mandate</li>
                  <li className='my-2'>User authorizes mandate through Oauth page redirects</li>
                  <li className='my-2'>Oauth provider redirects to merchant callback URL with Oauth grant</li>
                </ul>

                <div className='mt-4'>
                  <a href='/checkout' className='text-grey-darkest font-bold'>View Demo</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

Page.getInitialProps = async ({ req }) => {
  return {}
}

export default Page
