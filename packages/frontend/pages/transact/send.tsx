import React, { useState, useEffect } from "react"
import { NextPage } from "next"
import { Card, Content, Navigation, Button, TextInput, Selector, ToggleSwitch } from "./../../components"
import useForm from 'react-hook-form'
import { UsersService } from '../../services/users'
import { pay } from '../../services/pay'
import { checkUser, formatCurrency } from '../../utils'
import ky from 'ky-universal'
import getConfig from 'next/config'
import AmountInput from '../../components/amountInput'

const {publicRuntimeConfig} = getConfig()
const USERS_API_URL = publicRuntimeConfig.REACT_APP_USERS_API_URL

interface Options {
  value: number,
  label: string
}

type Props = {
  user: any
}

type PaymentDetails = {
  type: string
  paymentPointer: string
}

const usersService = UsersService()

type PaymentPointerCardProps = {
  setPaymentDetails: (any) => void
}

const PaymentPointerCard = (props: PaymentPointerCardProps) => {
  const {register, handleSubmit, errors, setError, clearError} = useForm()

  const onSubmit = async data => {
    const {paymentPointer} = data

    const url = new URL('/paymentpointers/validate', USERS_API_URL)
    url.searchParams.append('pp', paymentPointer)

    try {
      const response = await ky.get(url.toString()).json<Partial<PaymentDetails>>()
      props.setPaymentDetails({
        type: response.type,
        paymentPointer
      })
    } catch (error) {
      setError("sendPayment", "invalidPaymentPointer", "Invalid payment pointer")
    }
  }

  return (
    <Card>
      <div className="flex text-center m-8 text-headline-4">
        Send a payment to
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          errorState={errors.sendPayment != undefined}
          inputRef={(register({required: true}))}
          name='paymentPointer'
          label="Payment Pointer"
          inputType="text"
          hint={errors.sendPayment ? errors.sendPayment.type === 'required' ? 'Payment pointer required' : (errors.sendPayment.message) as string : undefined}
        />
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
  )

}

type PaymentCardProps = {
  paymentPointer: string
  token: string,
  userId: string
}

const PaymentCard = (props: PaymentCardProps) => {
  const [accounts, setAccounts] = useState<any>()
  const [selected, setSelected] = useState<Options>()
  const {register, handleSubmit, errors, setError, clearError} = useForm()

  useEffect(() => {
    usersService.getAccounts(props.token, props.userId).then(accounts => {
      const normalizedAccounts: Array<Options> = accounts.map(account => {
        return {
          value: account.id,
          label: `${account.name} ($${formatCurrency(account.balance,6)})`
        }
      })
      setAccounts(normalizedAccounts)
    })
  }, [])

  const onSend = async data => {
    if (selected) {
      if (validateAmount({target: {value: data.amount}})) {
        const getAccount = await usersService.getAccount(props.token, selected.value)
        const amount = data.amount * Math.pow(10, getAccount.assetScale)
        if (getAccount.balance >= amount) {
          pay(props.paymentPointer, amount, getAccount, props.token)
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

  return (
    <Card>
      <div className="flex justify-center pt-10 pb-8">
        <div className="flex content-center flex-wrap text-headline-5 truncate">
          {props.paymentPointer}
        </div>
      </div>
      <form onSubmit={handleSubmit(onSend)}>
        <TextInput
          inputType="text"
          errorState={errors.amount != undefined}
          validationFunction={validateAmount}
          inputRef={(register({required: true}))}
          name="amount"
          label="Amount"
          hint={errors.amount ? errors.amount.type === 'required' ? 'Amount required' : (errors.amount.message) as string : undefined}
        />
        <Selector
          options={accounts}
          onChange={(e) => setSelected(e)}
          hint={errors.selectAccount ? (errors.selectAccount.message) as string : undefined}
        />
        <div className="flex justify-center pt-2 pb-6">
          <Button type="solid" buttonType="submit">
            SEND
          </Button>
        </div>
      </form>
    </Card>
  )
}

const Transact: NextPage<Props> = ({user}) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    paymentPointer: 'http://localhost:3001/p/matt',
    type: 'open-payments'
  })

  return (
    <div className="flex">
      <Navigation active="transact"/>
      <Content navigation>
        <div className="flex justify-center">
          <ToggleSwitch
            active="SEND"
            text={["SEND", "RECEIVE"]}
            onClick={() => {
            }}
          />
        </div>
        <div className="flex justify-center mt-10">
          {
            paymentDetails ?
              <PaymentCard paymentPointer={paymentDetails.paymentPointer} token={user.token} userId={user.id}/>
              :
              <PaymentPointerCard setPaymentDetails={setPaymentDetails}/>
          }
        </div>
      </Content>
    </div>
  )
}

Transact.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  return {user}
}

export default Transact
