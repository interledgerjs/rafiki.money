import React from 'react'
import { NextPage } from "next"
import useForm from 'react-hook-form'
import { UsersService } from '../services/users'

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
    <div className="w-full max-w-xs mx-auto md:mt-32">
      <div className="flex flex-col mb-6">
        <img className="mx-auto h-32" src={'/logo_transparent.png'}/>
        <div className="text-center text-gray-800 text-lg font-light">
          Welcome Back!
        </div>
      </div>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="username" ref={(register({required: true}))}
            autoComplete="username"
            id="username" type="text" placeholder="Username"/>
          <p className="ml-1 h-2 text-xs text-red-600">{errors.username ? errors.username.message : ""}</p>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            name="password" ref={(register({required: true}))}
            autoComplete="current-password"
            id="password" type="password" placeholder="******************"/>
          <p className="ml-1 h-2 text-xs text-red-600">{errors.password ? errors.password.message : ""}</p>
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit">
          Login
        </button>
      </form>
      <div className="text-center mt-2 text-gray-600 text-light text-sm">
        Don't have an account?
      </div>
      <a href="/signup">
        <button
          className="shadow-md border-2 border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white w-full font-bold py-2 px-4 my-4 rounded"
          type="button">
          Create an Account
        </button>
      </a>
      <p className="text-center text-gray-500 text-xs">©2019 Rafiki Money. All rights reserved.</p>
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
