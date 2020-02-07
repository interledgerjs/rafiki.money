import React, { useRef } from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { TextInput, Button} from '../components'
import Link from 'next/link'
import { UsersService } from '../services/users'


const Signup: NextPage = () => {
  const {register, handleSubmit, errors, setError, clearError} = useForm()
  const formRef = useRef<HTMLFormElement>(null)

  const usersService = UsersService()

  const onSubmit = async data => {
    const emailState = validateEmail({ target: { value: data.username } })
    const passwordState = validatePassword({ target: { value: data.password } })
    if (emailState && passwordState) {
      await usersService.signup(data.username, data.password).then((data) => {
        window.location.href = `/login?signupSessionId=${data.signupSessionId}`
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
      return (true)
    }
  }

  const validatePassword = e => {
    let errorMessage = ''
    if (!/^(?=.*[a-z])/.test(e.target.value)) errorMessage += '(1 lowercase)'
    if (!/^(?=.*[A-Z])/.test(e.target.value)) errorMessage += '(1 uppercase)'
    if (!/^(?=.*[0-9])/.test(e.target.value)) errorMessage += '(1 number)'
    if (!/^(?=.{8,})/.test(e.target.value)) errorMessage += '(8 characters)'
    if (errorMessage.length > 0) {
      errorMessage = 'Required: ' + errorMessage
      setError("password", "invalidPassword", errorMessage)
      return (true)
    } else if (errors.password) {
      clearError('password')
      return (false)
    }
  }

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        <form ref={formRef} className='w-full max-w-xs' onSubmit={handleSubmit(onSubmit)}>
          <h2 className={`headline-4 text-on-surface text-center my-12`}>Sign up</h2>
          
          <div className=''>
            <TextInput  errorState={errors.username != undefined} validationFunction={validateEmail} inputRef={(register({required: true}))} name='username' label='email' hint={errors.username ? errors.username.type==='required'?'Email required':(errors.username.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div>
            <TextInput  errorState={errors.password != undefined} validationFunction={validatePassword} inputType='password' inputRef={(register({required: true}))} name='password' label='Password' hint={errors.password ? errors.password.type==='required'?'Password required':(errors.password.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div className='text-center my-12'>
            <a href='/' className='mr-4'>
              <Button onTap={() => { window.location.href = 'landing' }} bgColour="primary" type='text'>GO BACK</Button>
            </a>
            <Button disabled={Object.keys(errors).length > 0} bgColour="primary" type='solid' buttonType='submit'>SIGN UP</Button>
          </div>

        </form>
      </div>
    </div>
  )

}

Signup.getInitialProps = async ({}) => {

  // TODO Perhaps do a check if user is logged in already and rather redirect

  return {}
}

export default Signup
