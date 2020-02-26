import React, { useRef } from 'react'
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
  const {register, handleSubmit, errors, setError, clearError} = useForm()
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async data => {
    if (validateEmail({ target: { value: data.username } })) {
      const login = await usersService.login(data.username, data.password, login_challenge).then(resp => {
        if(resp.redirectTo) {
          window.location.href = resp.redirectTo
        }
      }).catch(async (error) => {
        console.log(error)
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
          <h2 className={`headline-4 text-on-surface text-center my-12`}>Login</h2>

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
              hint={ errors.password ? errors.password.type === 'required' ? 'Password required' : (errors.password.message) as string: null }
            />
          </div>

          <div className='text-center my-12'>
            <a href='/' className='mr-4'>
              <Button onClick={() => { window.location.href = 'landing' }} bgColour="primary" type='text'>GO BACK</Button>
            </a>
            <Button disabled={Object.keys(errors).length > 0} bgColour="primary" type='solid' buttonType='submit'>LOGIN</Button>
          </div>

        </form>
      </div>
    </div>
  )

}

Login.getInitialProps = async ({query, res}) => {
  const { login_challenge, signupSessionId } = query

  if(!login_challenge) {
    const url = signupSessionId ? HYDRA_LOGIN_GRANT_URL + `&signupSessionId=${signupSessionId}` : HYDRA_LOGIN_GRANT_URL
    if(res) {
      res.writeHead(302, {
        Location: url
      })
      res.end()
      return
    }

    window.location.href = url
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
