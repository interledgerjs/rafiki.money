import React, { useEffect, useState } from 'react'
import { NextPage } from "next"
import { Button, Card, Content, Navigation } from '../../components'
import { checkUser, formatCurrency } from '../../utils'
import {AccountsService} from '../../services/accounts'
import { UsersService } from '../../services/users'
import { MandatesService } from '../../services/mandates'
import Modal from 'react-modal'
import { useRouter } from 'next/router'

const accountService = AccountsService()
const usersService = UsersService()
const mandatesService = MandatesService()

type User = {
  id: string
}

type Mandate = {
  id: string
  name: string
  description: string,
  assetCode: string,
  assetScale: number,
  amount: number,
  balance: number,
  startAt: string,
  expireAt?: string,
  interval?: string,
  scope: string
}

type Props = {
  user: User
  mandate: Mandate
  token: string
}

const Mandate: NextPage<Props> = ({user, mandate, token}) => {
  const router = useRouter()
  const [localMandate, setLocalMandate] = useState<Mandate>(mandate)

  const refreshMandates = async () => {
    const mandate = await mandatesService.getTransactionsByMandateId(token, localMandate.id)
    setLocalMandate(mandate)
  }
  const [transactions, setTransactions] = useState([])

  // const getTransactions = () => {
  //   accountService.transactions(localAccount.id.toString(), token).then(transactions => {
  //     setTransactions(transactions)
  //   })
  // }

  // useEffect(() => {
  //   getTransactions()
  // }, [localAccount])

  // const addFunds = async () => {
  //   await accountService.faucet(localAccount.id, token)
  //   getTransactions()
  //   refreshAccounts()
  // }

  const formatDate = (date: string) => {
    const jsDate = new Date(date)
    return jsDate.getDate() + '-' + jsDate.getMonth() + '-' + jsDate.getUTCFullYear()
  }

  const [modalIsOpen,setIsOpen] = React.useState(false);
  const openModal = () => {
    setIsOpen(true)
  }

  function closeModal(){
    setIsOpen(false);
  }

  const cancelMandate = (mandateId: string) => {
    mandatesService.cancelMandate(mandateId, token).then(() => {
      closeModal()
      router.push('/mandates')
    })
  }

  return (
    <div>
      <Navigation active="overview"></Navigation>
      <Content navigation>
        <div className="flex flex-col sm:flex-row h-full justify-center">
          <div className="flex flex-col h-full w-full">
            <div className="flex flex-col sm:flex-row justify-between w-full">
              <Card className="flex flex-col w-full h-full">
              <div className="flex justify-end">
                <Button onClick={openModal} type="text" textColour="red">
                  Cancel
                </Button>
              </div>
                <div className="flex justify-between">
                  <div className="text-headline-4 flex-1 truncate">
                    {localMandate.name}
                  </div>
                  {/* <div onClick={addFunds} className="flex">
                    <Button className="my-auto" type="text">
                      Add funds
                    </Button>
                  </div> */}
                </div>
                {/* <div className="text-headline-5 truncate">
                  $ {formatCurrency(Number(localAccount.balance), 6)}
                </div> */}
              </Card>
            </div>
            <div className="flex mt-8 justify-between">
              <div className="text-headline-6 my-auto text-on-surface">
                Transactions
              </div>
            </div>
            <div className="flex flex-col justify-between w-full flex-wrap mt-8">
              {
                transactions.map(transaction => {
                  return (
                    <Card className="mb-4" key={transaction.id}>
                      <div className="flex flex-row">
                        <div className="button self-center text-purple">
                          {formatDate(transaction.createdAt)}
                        </div>
                        <div className={`flex-1 self-center text-right my-auto text-headline-6 ${transaction.amount < 0 ? 'text-red' : 'text-green'}`}>
                          $ {formatCurrency(transaction.amount, 6)}
                        </div>
                      </div>
                        
                    </Card>
                  )
                })
              }
            </div>
          </div>
        </div>
      </Content>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        style={{
          overlay: {
            backgroundColor: 'var(--color-modal-background)'
          },
          content : {
            backgroundColor       : 'var(--color-surface-elevation-24)',
            border                : 'none',
            top                   : '50%',
            left                  : '50%',
            right                 : 'auto',
            bottom                : 'auto',
            marginRight           : '-50%',
            transform             : 'translate(-50%, -50%)'
          }
        }}
      >
        <div className="max-w-xs w-full text-on-surface flex flex-col">
          <div className="headline-6">
            Cancel Mandate?
          </div>
          <div className="body-1 my-6">
            By cancelling this mandate you will no longer allow the holder to debit your account.
          </div>
          <div className="flex justify-end">
            <Button type='text' className="mr-2" onClick={closeModal}>
              Disagree
            </Button>
            <Button type='text' onClick={() => cancelMandate(localMandate.id)}>
              Agree
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

Mandate.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)
  const mandateId = ctx.query.account + ''
  const mandate = await mandatesService.getTransactionsByMandateId(user.token, mandateId)

  return {
    user,
    mandate,
    token: user.token
  }
}

export default Mandate
