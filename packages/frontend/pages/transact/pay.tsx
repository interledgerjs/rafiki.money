import React, { useState, useEffect } from "react"
import { NextPage } from "next"
import { Card, Content, Navigation, Button, TextInput, Selector, ToggleSwitch } from "./../../components"
import useForm from 'react-hook-form'
import { UsersService } from '../../services/users'
import { payInvoice } from '../../services/pay'
import { checkUser, formatCurrency } from '../../utils'
import ky from 'ky-universal'
import getConfig from 'next/config'
import SquareLoader from "react-spinners/SquareLoader";
import Router from 'next/router'

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
  setInvoiceDetails: (any) => void
}

const InvoiceCard = (props: PaymentPointerCardProps) => {
  const {register, handleSubmit, errors, setError, clearError} = useForm()

  const onSubmit = async data => {
    const { invoice } = data

    const url = new URL(`${USERS_API_URL}/validate/invoices`)
    url.searchParams.append('q', invoice)

    try {
      const response = await ky.get(url.toString()).json<Partial<PaymentDetails>>()
      props.setInvoiceDetails(response)
    } catch (error) {
      setError("sendPayment", "invalidInvoice", "Invalid Invoice")
    }
  }

  return (
    <Card>
      <div className="flex text-center m-8 text-headline-4">
        Pay to an Invoice
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          errorState={errors.sendPayment != undefined}
          inputRef={(register({required: true}))}
          name='invoice'
          label="Invoice"
          inputType="text"
          hint={errors.sendPayment ? errors.sendPayment.type === 'required' ? 'Invoice required' : (errors.sendPayment.message) as string : undefined}
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

type Invoice = {
  name: string,
  amount: string,
  assetCode: string,
  assetScale: number
}

type PaymentCardProps = {
  invoice: Invoice,
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
        await payInvoice(props.invoice.name, Number(props.invoice.amount), selectedAccount.value, props.token).then(async (response) => {
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
      <div>
        <div className="my-2">
          <div className="overline text-on-surface-disabled">
            Amount
          </div>
          <div className="headline-6">
            {formatCurrency(Number(props.invoice.amount), props.invoice.assetScale)} {props.invoice.assetCode}
          </div>
        </div>
        <div className="my-2">
          <div className="overline text-on-surface-disabled">
            Description
          </div>
          <div className="headline-6">
            {}
          </div>
        </div>
        <form onSubmit={handleSubmit(onSend)}>
          <Selector
            options={accounts}
            onChange={(e) => setSelectedAccount(e)}
            hint={errors.selectAccount ? (errors.selectAccount.message) as string : undefined}
          />
          <div className="-mt-2 mb-6 px-2 py-2 bg-primary-100 rounded overline text-black font-bold">
            ≈ {formatCurrency(Number(props.invoice.amount), props.invoice.assetScale)} {props.invoice.assetCode}
          </div>
          <div className="flex justify-end pt-2 pb-2">
            <Button type="text" buttonType="reset">
              Cancel
            </Button>
            <Button disabled={!selectedAccount} type="solid" buttonType="submit" className="ml-4">
              Pay
            </Button>
          </div>
        </form>
      </div>
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
      <div className="text-headline-5 justify-center pb-4">
        Payment
      </div>
      {!(isSending || paymentStatus) ? RenderPaymentDetails() : null}
      {isSending ? RenderLoading() : null}
      {paymentStatus ? RenderPaymentStatus() : null}
    </Card>
  )
}

const Transact: NextPage<Props> = ({user}) => {
  const [paymentDetails, setPaymentDetails] = useState<Invoice>()

  return (
    <div>
      <Navigation active="transact"/>
      <Content navigation>
        <div className="flex justify-center">
          <ToggleSwitch
            active="PAY"
            text={["SEND", "PAY"]}
            onClick={(changed) => {
              if(changed === 'SEND') {
                Router.push('/transact/send')
              }
            }}
          />
        </div>
        <div className="flex justify-center mt-10">
          {
            paymentDetails ?
              <PaymentCard invoice={paymentDetails}
                           token={user.token}
                           userId={user.id}
                           setPaymentDetails={setPaymentDetails}
              />
              :
              <InvoiceCard setInvoiceDetails={setPaymentDetails}/>
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
