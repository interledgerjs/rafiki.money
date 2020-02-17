import React, { useState } from 'react'
import { NextPage } from "next"
import Link from 'next/link'
import { Card, Content, Navigation, Button, TextInput, Selector } from '../components'

const Transact: NextPage = ()=> {
  const [count, setCount] = useState(0)
  const [toggle, setToggle] = useState('send')
  if (toggle == 'receive'){
    if (count == 1 )
      setCount(0)
    return (
    <div className="flex">
      <Navigation active="transact"></Navigation>
      <Content navigation>
        <div className="flex justify-center">
          <Button toggle textColour='default' type='text' buttonType='submit' onTap={() => setToggle('send')}>SEND </Button>
          <Button toggle type='solid' buttonType='submit'>RECEIVE </Button>
        </div>
        <div className="pb-10"></div>
        <div className="flex justify-center">
          <Card>
            <span className="flex text-center m-8 text-headline-4">Receive a payment from</span>
            <TextInput inputType="text" name="" label="Payment pointer" style={{ position: 'relative', height: '72px', marginTop: '20px', marginBottom: '20px' }}></TextInput>
            <div className="flex justify-center pt-4 pb-6">
              <Button type='solid' buttonType='submit' onTap={() => setCount(count + 1)}>NEXT</Button>
            </div>
          </Card>
        </div>
      </Content>
    </div>
  )

  }
  if (count == 1){
    return (
      <div className="flex">
        <Navigation active="transact"></Navigation>
        <Content navigation>
          <div className="flex justify-center">
          <Button toggle type='solid' buttonType='submit'>SEND </Button>
          <Button toggle textColour='default' type='text' buttonType='submit' onTap={() => setToggle('receive')}>RECEIVE </Button>
          </div>
          <div className="pb-10"></div>
          <div className="flex justify-center">
            <Card>
            <div className="flex justify-center pt-10 pb-8">
              <img className = 'listline-img' src="http://placecorgi.com/200"></img>
              <span className="flex content-center flex-wrap text-headline-5">Bob's Burgers</span>
              </div>
              <TextInput inputType="text" name="" label="Amount" style={{ position: 'relative', height: '72px', marginTop: '20px', marginBottom: '20px' }}></TextInput>
              <div className = "pb-10">
                <Selector></Selector>
              </div>
              <div className="flex justify-center pt-4 pb-6">
              <Button type='solid' buttonType='submit'>SEND</Button>
            </div>
            </Card>
          </div>
        </Content>
      </div>
    )
  }
  return (
    <div className="flex">
      <Navigation active="transact"></Navigation>
      <Content navigation>
        <div className="flex justify-center">
          <Button toggle type='solid' buttonType='submit'>SEND </Button>
          <Button toggle textColour='default' type='text' buttonType='submit' onTap={() => setToggle('receive')}>RECEIVE </Button>
        </div>
        <div className="pb-10"></div>
        <div className="flex justify-center">
          <Card>
            <span className="flex text-center m-8 text-headline-4">Send a payment to</span>
            <TextInput inputType="text" name="" label="Payment pointer" style={{ position: 'relative', height: '72px', marginTop: '20px', marginBottom: '20px' }}></TextInput>
            <div className="flex justify-center pt-4 pb-6">
              <Button type='solid' buttonType='submit' onTap={() => setCount(count + 1)}>NEXT</Button>
            </div>
          </Card>
        </div>
      </Content>
    </div>
  )
}

export default Transact
