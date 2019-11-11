import React, { useState, useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { UsersService } from '../services/users'

const HYDRA_LOGIN_GRANT_URL = process.env.REACT_APP_LOGIN_GRANT_URL || 'http://localhost:9000/oauth2/auth?client_id=wallet-gui-service&response_type=token&state=loginflow&scope=offline openid&redirect_uri=http://localhost:3000/callback'
type LoginProps = {
  authenticate: (token: string) => void
} & RouteComponentProps

const Login: React.FC<LoginProps> = (props) => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [challenge, setChallenge] = useState()
  const users = UsersService()

  useEffect(() => {
    getHydraGrantRequest()
  }, [])

  async function getHydraGrantRequest() {
    const url = new URL(window.location.href)
    const urlChallenge = url.searchParams.get('login_challenge')
    if (!urlChallenge) {
      window.location.href = HYDRA_LOGIN_GRANT_URL
    }
    setChallenge(urlChallenge)
  }

  async function handleLogin() {
    const { redirectTo } = await users.login(username, password, challenge)
    window.location.href = redirectTo
  }

  return challenge ?
    <div className="w-full max-w-xs mx-auto md:mt-32">
      <div className="flex flex-col mb-6">
        <img className="mx-auto h-32" src={process.env.PUBLIC_URL + '/logo_transparent.png'}/>
        <div className="text-center text-grey-dark text-lg font-light">
          Welcome Back!
        </div>
      </div>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2">Username</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block text-grey-darker text-sm font-bold mb-2">Password</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleLogin}>Login</button>
      </form>
      <div className="text-center mt-2 text-grey-dark text-light text-sm">
        Don't have an account?
      </div>
      <Link to="/signup">
        <button className="shadow-md border-2 border-grey-dark text-grey-dark hover:bg-grey-dark hover:text-white w-full font-bold py-2 px-4 my-4 rounded" type="button">Create an Account</button>
      </Link>
      <p className="text-center text-grey text-xs">©2019 Rafiki Money. All rights reserved.</p>
    </div>
    : null
}

export default Login;
