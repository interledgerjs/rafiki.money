import React, { useRef } from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { TextInput, Button} from '../components'
import Link from 'next/link'
import { UsersService } from '../services/users'
import { useRouter } from 'next/router'


const Signup: NextPage = () => {
  const router = useRouter()
  const {register, handleSubmit, errors, setError, clearError} = useForm()
  const formRef = useRef<HTMLFormElement>(null)

  const usersService = UsersService()

  const onSubmit = async data => {
    if (validateEmail({ target: { value: data.username } })) {
      await usersService.signup(data.username, data.password).then((data) => {
        window.location.href = `/login?signupSessionId=${data.signupSessionId}`
      }).catch(async (error) => {
        const body = await error.response.json()
        body.errors.forEach((el) => {
          if (el.field === 'username')
            setError('username', 'usernameError', el.message)
          else if (el.field === 'password')
            setError('password', 'passwordError', el.message)
        })
      })
    }
  }

  const validateEmail = e => {
    const emailRegex = RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
    if (!emailRegex.test(e.target.value)) {
      setError("username", "invalidEmail", "Please submit a valid email address")
      return (false)
    } else if (errors.username) {
      clearError('username')
    }
    return (true)
  }

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        <form ref={formRef} className='w-full max-w-xs' onSubmit={handleSubmit(onSubmit)}>
          <h2 className={`headline-4 text-on-surface text-center my-12`}>Sign up</h2>

          <div className=''>
            <TextInput
              errorState={errors.username != undefined}
              validationFunction={validateEmail}
              inputRef={(register({required: true}))}
              name='username'
              label='Email'
              hint={errors.username ? errors.username.type==='required' ? 'Email required' : (errors.username.message) as string : undefined}
            />
          </div>

          <div>
            <TextInput
              errorState={errors.password != undefined}
              inputType='password'
              inputRef={(register({required: true}))}
              name='password'
              label='Password'
              hint={ errors.password ? errors.password.type === 'required' ? 'Password required' : null: null }
            />
          </div>

          <div className='text-center my-12'>
<<<<<<< HEAD
            <Button onClick={() => router.push('/')} className="mr-4" bgColour="primary" type='text'>GO BACK</Button>
=======
            <Button onTap={ () => { window.location.href = '/' } } className="mr-4" bgColour="primary" type='text'>GO BACK</Button>
>>>>>>> origin/invoicePayment
            <Button disabled={Object.keys(errors).length > 0} type='solid' buttonType='submit'>SIGN UP</Button>
          </div>

        </form>
      </div>
    </div>
  )

}

export default Signup
