import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Link } from 'react-router-dom'
import { UsersService } from '../services/users'

const HYDRA_LOGIN_GRANT_URL = process.env.REACT_APP_LOGIN_GRANT_URL || 'http://localhost:9000/oauth2/auth?client_id=wallet-gui-service&response_type=token&state=harrypotter&scope=offline openid&redirect_uri=http://localhost:3000/callback'

type SignupProps = {
  authenticate: (token: string) => void
} & RouteComponentProps

const Signup: React.FC<SignupProps> = (props) => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState()
  const users = UsersService()

  async function handleSignup () {
    try {
      await users.signup(username, password).then(data => { console.log('successfully signed up', data) })
      window.location.href = HYDRA_LOGIN_GRANT_URL
    } catch (error) {
      setErrors(error.response.data)
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto md:mt-32">
      <div className="flex flex-col mb-6">
        <img className="mx-auto h-32" src={process.env.PUBLIC_URL + '/logo_transparent.png'}/>
        <div className="text-center text-grey-dark text-lg font-light">
          Create an Account!
        </div>
      </div>
      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {
          errors ?
          <div className="bg-red-lightest border border-red-light text-red-dark px-4 py-3 rounded relative mb-2" role="alert">
            <span className="block sm:inline">{errors}</span>
          </div>
          : null
        }
        <div className="mb-4">
          <label className="block text-grey-darker text-sm font-bold mb-2">Username</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username" onChange={(event) => setUsername(event.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block text-grey-darker text-sm font-bold mb-2">Password</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" onChange={(event) => setPassword(event.target.value)} />
        </div>
        <button className="w-full bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleSignup}>Sign up</button>
      </form>
      <div className="text-center mt-2 text-grey-dark text-light text-sm">
        Have an account already?
      </div>
      <Link to="/login">
        <button className="shadow-md border-2 border-grey text-grey-dark hover:bg-grey-dark hover:text-white w-full font-bold py-2 px-4 my-4 rounded" type="button">Login</button>
      </Link>
      <p className="text-center text-grey text-xs">©2019 Rafiki Money. All rights reserved.</p>
    </div>
  );
}

export default Signup;
