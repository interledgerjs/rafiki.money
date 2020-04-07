import React, { useRef, useState } from 'react'
import { NextPage } from "next"
import { Button, Content, TextInput } from '../../components'
import { checkUser } from '../../utils'
import useForm from 'react-hook-form'
import Link from 'next/link'
import { AccountsService } from '../../services/accounts'
import Router from 'next/router'

type Props = {
  token: string
}

const accountService = AccountsService()

const CreateAccount: NextPage<Props> = ({token}) => {
  const {register, handleSubmit, errors, setError, clearError} = useForm()
  const [isSubmitting, setIsSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async (data) => {
    if(!isSubmitting) {
      setIsSubmitted(true)
      const account = await accountService.create(data.name, token)
        .then(() => {
          Router.push('/overview')
        })
        .finally(() => {
          setIsSubmitted(false)
        })
    }
  }

  return (
    <div className='w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        <form ref={formRef} className="flex w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-md flex mx-auto flex-col">
            <div className="text-headline-4 text-center text-on-surface max-w-xs">
              Give your new account a name
            </div>
            <div className="w-full mt-4">
              <TextInput
                className="mx-auto"
                inputType='text'
                inputRef={(register({required: true}))}
                name='name'
                label='Account Name'
                bgColour='surface'
              />
            </div>
            <div className="flex mx-auto mt-8">
              <Link href="/overview">
                <a>
                  <Button type="text" className="mx-2">
                    Go Back
                  </Button>
                </a>
              </Link>
              <Button type="solid" className="mx-2" buttonType='submit'>
                Create
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateAccount.getInitialProps = async (ctx) => {
  const user = await checkUser(ctx)

  return {
    token: user.token
  }
}

export default CreateAccount
