import React from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { UsersService } from '../services/users'
import { Button, TextInput } from '../components'

const usersService = UsersService()

const HYDRA_LOGIN_GRANT_URL = process.env.REACT_APP_LOGIN_GRANT_URL || 'http://localhost:9000/oauth2/auth?client_id=frontend-client&state=loginflow&response_type=code&redirect_uri=http://localhost:3000/callback'

type Props = {
  login_challenge: string
}

const Login: NextPage<Props> = ({login_challenge}) => {
  const {register, handleSubmit, errors, setError} = useForm()


  const onSubmit = async data => {
    const login = await usersService.login(data.username, data.password, login_challenge).then(resp => {
      if(resp.redirectTo) {
        window.location.href = resp.redirectTo
      }
    }).catch(error => {
      console.log(error)
    })
  }

  return (
    <div className = 'w-full h-full bg-surface'>
      <div className='w-full h-screen max-w-xs mx-auto flex items-center'>
        
        <form className='w-full max-w-xs' onSubmit={handleSubmit(onSubmit)}>
          <h2 className={`headline-4 text-on-surface text-center mb-12`}>Login</h2>

          <div className=''>
            <TextInput inputRef={(register({required: true}))} name='username' label='email' hint={errors.username ? (errors.username.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div>
            <TextInput inputType='password' inputRef={(register({required: true}))} name='password' placeHolder='Password' hint={errors.password ? (errors.password.message) as string : undefined} style={{position:'relative',height:'72px',marginTop:'20px',marginBottom:'20px'}}></TextInput>
          </div>

          <div className='text-center mt-12'>
            <a href='/' className='mr-4'>
              <Button onTap={() => {}} bgColour='primary' to='/login' type='text'>GO BACK</Button>
            </a>
            <Button onTap={() => {}} bgColour='primary' to='/login' type='solid' buttonType='submit'>LOGIN</Button>
          </div>

        </form>
      </div>
    </div>
  )

}

Login.getInitialProps = async ({query, res}) => {
  const { login_challenge, signupSessionId } = query

  if(!login_challenge) {
    res.writeHead(302, {
      Location: signupSessionId ? HYDRA_LOGIN_GRANT_URL + `&signupSessionId=${signupSessionId}` : HYDRA_LOGIN_GRANT_URL
    })
    res.end()
    return
  }

  // Check loginChallenge to see if it can be skipped.
  const login = await usersService.getLogin(login_challenge.toString()).then(resp => {
    if(resp.redirectTo) {
      res.writeHead(302, {
        Location: resp.redirectTo
      })
      res.end()
    }
    return resp
  }).catch(error => {
    console.log(error)
  })

  return {
    login_challenge: query.login_challenge ? query.login_challenge.toString() : ''
  }
}

export default Login
