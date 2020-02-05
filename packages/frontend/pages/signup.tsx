import React from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { TextInput, Button} from '../components'
import Link from 'next/link'
import { UsersService } from '../services/users'


const Signup: NextPage = () => {
  const {register, handleSubmit, errors, setError, setValue} = useForm()

  const usersService = UsersService()

  const onSubmit = async data => {
    await usersService.signup(data.username, data.password).then((data) => {
      window.location.href = `/login?signupSessionId=${data.signupSessionId}`
    })
    // setError('password', "password", "Incorrect password")
  }

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto bg-surface flex items-center'>
        
        <form className='w-full max-w-xs' onSubmit={handleSubmit(onSubmit)}>
          <h2 className={`headline-4 text-on-surface text-center my-12`}>Sign up</h2>
          
          <div className=''>
            <TextInput inputRef={(register({required: true}))} name='username' label='email' hint={errors.username ? (errors.username.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div>
            <TextInput inputType='password' inputRef={(register({required: true}))} name='password' label='Password' hint={errors.password ? (errors.password.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div className='text-center my-12'>
            <a href='/' className='mr-4'>
              <Button onTap={() => {}} bgColour='primary' to='/login' type='text'>GO BACK</Button>
            </a>
            <Button onTap={() => {}} bgColour='primary' to='/login' type='solid' buttonType='submit'>SIGN UP</Button>
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
