import React, { useState, useRef } from "react"
import { NextPage } from "next"
import { Card, Content, Navigation, Button, TextInput, Selector, ToggleSwitch } from "../components"
import useForm from 'react-hook-form'
import { UsersService } from '../services/users'
import { pay } from '../services/pay'
import { checkUser } from '../utils'
import ky from 'ky-universal'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

interface Options {
  value: number,
  label: string
}

type Props = {
  user: any
}

const usersService = UsersService()

const Transact: NextPage<Props> = ({user}) => {
  const [count, setCount] = useState(0)
  const [toggle, setToggle] = useState("SEND")
  const [accounts] = useState<Options[]>([])
  const [selected, setSelected] = useState<Options>()
  const [paymentPointer, setPaymentPointer] = useState("")

  const { register, handleSubmit, errors, setError, clearError } = useForm()
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async data => {
    const receiver = data.paymentPointer.slice(1)
    const url = new URL(USERS_API_URL.split('/', 1) + `${receiver}`)
    if (url.origin + '/' == USERS_API_URL) {
      const getUser = await ky.get(url.toString()).catch((error) => { })
      if (getUser) {
        setPaymentPointer(data.paymentPointer)
        const getAccounts = await usersService.getAccounts(user.token, user.id)
        if (getAccounts.length === 0)
          setError("sendPayment", "noExsistingAccounts", "Please create an account first")
        else {
          getAccounts.forEach(element => {
            accounts.push({ value: element.id, label: element.name })
          })
        }
        setCount(1)
      } else {
        setError("sendPayment", "invalidPaymentPointer", "Payment pointer does not exist")
      }
    }
    else {
      setError("sendPayment", "invalidPaymentPointer", "Invalid payment pointer")
    }
  }


  const onSend = async data => {
    if (selected) {
      if (validateAmount({ target: { value: data.amount } })) {
        const getAccount = await usersService.getAccount(user.token, selected.value)
        const amount = data.amount * Math.pow(10, getAccount.assetScale)
        if (getAccount.balance >= amount) {
          pay(paymentPointer, amount, getAccount, user.token)
          // TO DO resolve PP
        } else {
          setError("amount", "invalidAmount", "Not enough funds in account")
        }
      }
    } else {
      setError("selectAccount", "noAccountSelected", "Please select an account")
    }
  }

  const validateAmount = e => {
    const amountRegex = RegExp(/^[0-9]+(\.[0-9]{1,6})?$/)
    if (!amountRegex.test(e.target.value)) {
      setError("amount", "invalidAmount", "Please submit a valid amount")
      return (false)
    } else if (errors.amount) {
      clearError('amount')
    }
    return (true)

  }

  if (toggle == "RECEIVE") {
    if (count == 1) setCount(0)
    return (
      <div className="flex">
        <Navigation active="transact"></Navigation>
        <Content navigation>
          <div className="flex justify-center">
            <ToggleSwitch
              active={toggle}
              text={["SEND", "RECEIVE"]}
              onClick={() => setToggle(document.activeElement.textContent)}
            ></ToggleSwitch>
          </div>
          <div className="pb-10"></div>
          <div className="flex justify-center">
            <Card>
              <span className="flex text-center m-8 text-headline-4">
                Receive a payment from
              </span>
              <TextInput
                inputType="text"
                name=""
                label="Payment pointer"
              ></TextInput>
              <div className="flex justify-center pt-4 pb-6">
                <Button
                  type="solid"
                  buttonType="submit"
                  onClick={() => setCount(count + 1)}
                >
                  NEXT
                </Button>
              </div>
            </Card>
          </div>
        </Content>
      </div>
    )
  }
  if (count == 1) {
    return (
      <div className="flex">
        <Navigation active="transact"></Navigation>
        <Content navigation>
          <div className="flex justify-center">
            <ToggleSwitch
              active={toggle}
              text={["SEND", "RECEIVE"]}
              onClick={() => setToggle(document.activeElement.textContent)}
            ></ToggleSwitch>
          </div>
          <div className="pb-10"></div>
          <div className="flex justify-center">
            <Card>
              <div className="flex justify-center pt-10 pb-8">
                <img
                  className="listline-img"
                  src="http://placecorgi.com/200"
                ></img>
                <span className="flex content-center flex-wrap text-headline-5">
                  Bob's Burgers
                </span>
              </div>
              <form ref={formRef} onSubmit={handleSubmit(onSend)}>
                <TextInput
                  inputType="text"
                  errorState={errors.amount != undefined}
                  validationFunction={validateAmount}
                  inputRef={(register({ required: true }))}
                  name="amount"
                  label="Amount"
                  hint={errors.amount ? errors.amount.type === 'required' ? 'Amount required' : (errors.amount.message) as string : undefined}
                ></TextInput>
                <div className="pb-10">
                  <Selector
                    options={accounts}
                    onChange={(e) => setSelected(e)}
                    hint={errors.selectAccount ? (errors.selectAccount.message) as string : undefined}
                  ></Selector>
                </div>
                <div className="flex justify-center pt-4 pb-6">
                  <Button type="solid" buttonType="submit">
                    SEND
                </Button>
                </div>
              </form>
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
          <ToggleSwitch
            active={toggle}
            text={["SEND", "RECEIVE"]}
            onClick={() => setToggle(document.activeElement.textContent)}
          ></ToggleSwitch>
        </div>
        <div className="pb-10"></div>
        <div className="flex justify-center">
          <Card>
            <span className="flex text-center m-8 text-headline-4">
              Send a payment to
            </span>
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
              <TextInput
                errorState={errors.sendPayment != undefined}
                inputRef={(register({ required: true }))}
                name='paymentPointer'
                label="Payment pointer"
                inputType="text"
                hint={errors.sendPayment ? errors.sendPayment.type === 'required' ? 'Payment pointer required' : (errors.sendPayment.message) as string : undefined}
              ></TextInput>
              <div className="flex justify-center pt-4 pb-6">
                <Button
                  type="solid"
                  buttonType="submit"
                >
                  NEXT
              </Button>
              </div>
            </form>
          </Card>
        </div>
      </Content>
    </div>
  )
}

Transact.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  return { user }
}

export default Transact
