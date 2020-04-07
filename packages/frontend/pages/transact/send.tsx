import React, { useState, useEffect } from "react"
import { NextPage } from "next"
import { Card, Content, Navigation, Button, TextInput, Selector, ToggleSwitch } from "./../../components"
import useForm from 'react-hook-form'
import { UsersService } from '../../services/users'
import { pay } from '../../services/pay'
import { checkUser, formatCurrency } from '../../utils'
import ky from 'ky-universal'
import getConfig from 'next/config'
import SquareLoader from "react-spinners/SquareLoader";

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

    const url = new URL(`${USERS_API_URL}/paymentpointers/validate`)
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
  type: string,
  token: string,
  userId: string
  setPaymentDetails: (any) => void
}

type PaymentStatus = {
  success: boolean
  sent?: string
}

const PaymentCard = (props: PaymentCardProps) => {
  const [accounts, setAccounts] = useState<any>()
  const [selectedAccount, setSelectedAccount] = useState<Options>()
  const {register, handleSubmit, errors, setError} = useForm()
  const [isSending, setIsSending] = useState<boolean>(false)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>()

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
    if (selectedAccount) {
      if(!isSending) {
        setIsSending(true)
        await pay(props.paymentPointer, data.amount, selectedAccount.value, props.type, props.token).then(async (response) => {
          const body = await response.json()
          setPaymentStatus({
            success: true,
            sent: body.sent
          })
        }).catch((error) => {
          setPaymentStatus({
            success: false
          })
        }).finally(() => {
          setIsSending(false)
        })
      }
    } else {
      setError("selectAccount", "noAccountSelected", "Please select an account")
    }
  }

  const RenderLoading = () => {
    return (
      <div className="h-64 flex">
        <div className="content-center mx-auto my-auto justify-center w-24">
          <SquareLoader
            size={75}
            color={"#21D2BF"}
          />
        </div>
      </div>
    )
  }

  const RenderPaymentDetails = () => {
    return (
      <form onSubmit={handleSubmit(onSend)}>
        <TextInput
          inputType="text"
          errorState={errors.amount != undefined}
          inputRef={(register({required: true, pattern: /^[0-9]+(\.[0-9]{1,6})?$/}))}
          name="amount"
          label="Amount"
          hint={errors.amount ? errors.amount.type === 'required' ? 'Amount required' : (errors.amount.message) as string : undefined}
        />
        <Selector
          options={accounts}
          onChange={(e) => setSelectedAccount(e)}
          hint={errors.selectAccount ? (errors.selectAccount.message) as string : undefined}
        />
        <div className="flex justify-center pt-2 pb-6">
          <Button type="solid" buttonType="submit">
            SEND
          </Button>
        </div>
      </form>
    )
  }

  const resetPayment = () => {
    props.setPaymentDetails(undefined)
  }


  const RenderPaymentStatus = () => {
    if(paymentStatus.success) {
      return (
        <div className="h-64 flex flex-col">
          <div className="text-center text-primary headline-6">
            Successfully sent!
          </div>
          <div className="flex mx-auto headline-3">
            {formatCurrency(Number(paymentStatus.sent), 6)}
          </div>
          <div className="flex mx-auto body-1  text-on-surface-disabled">
            USD
          </div>
          <Button onClick={resetPayment} type='solid' className="w-32 mx-auto mt-8">
            Done
          </Button>
        </div>
      )
    } else {
      return (
        <div className="h-64 flex flex-col">
          <div className="text-center text-primary headline-6">
            Failed to send
          </div>
          <Button onClick={resetPayment} type='solid' className="w-32 mx-auto mt-8">
            Try Again
          </Button>
        </div>
      )
    }
  }

  return (
    <Card>
      <div className="flex justify-center pt-10 pb-8">
        <div className="flex content-center flex-wrap text-headline-5 truncate">
          {props.paymentPointer}
        </div>
      </div>
      {!(isSending || paymentStatus) ? RenderPaymentDetails() : null}
      {isSending ? RenderLoading() : null}
      {paymentStatus ? RenderPaymentStatus() : null}
    </Card>
  )
}

const Transact: NextPage<Props> = ({user}) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>()

  return (
    <div>
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
              <PaymentCard paymentPointer={paymentDetails.paymentPointer}
                           token={user.token}
                           userId={user.id}
                           type={paymentDetails.type}
                           setPaymentDetails={setPaymentDetails}
              />
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
