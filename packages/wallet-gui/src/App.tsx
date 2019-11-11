import React, { useState, useEffect, createContext } from 'react'
import Home from './pages/home'
import Login from './pages/login'
import Signup from './pages/signup'
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom"
import { ShowAccount } from './pages/accounts/show'
import { CreateAccount } from './pages/accounts/create'
import { Agreements } from './pages/agreements/index'
import { ShowAgreement } from './pages/agreements/show'
import Header from './components/header'
import Checkout from "./pages/payment-handler"
import Consent from "./pages/consent"
import Callback from "./pages/callback"
import { UsersService } from './services/users'
import {UserSettings} from "./pages/user/settings"
import OauthRegistration from './pages/oauth-registration'

const HYDRA_LOGIN_GRANT_URL = process.env.REACT_APP_LOGIN_GRANT_URL || 'http://localhost:9000/oauth2/auth?client_id=wallet-gui-service&response_type=token&state=loginflow&scope=offline openid&redirect_uri=http://localhost:3000/callback'

export const AuthContext = createContext({
  token: '',
  deleteToken: (): void => {
    window.localStorage.removeItem('token')
  },
  getUser: async (force?: boolean): Promise<{ id: string, username: string, defaultAccountId: string }> => {
    return { id: '', username: '' , defaultAccountId: '' }
  },
  handleAuthError: (): void => {
    window.localStorage.removeItem('token')
    window.location.href = HYDRA_LOGIN_GRANT_URL
  }
})

const App: React.FC = () => {

  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const users = UsersService()

  useEffect(() => { setToken(getToken()) }, [])

  function storeToken (token: string) {
    window.localStorage.setItem('token', token)
    setToken(token)
  }

  function deleteToken () {
    window.localStorage.removeItem('token')
    setToken('')
    setUser(null)
  }

  function getToken(): string {
    const token = window.localStorage.getItem('token')
    return token || ''
  }

  function isAuthenticated() {
    return getToken() !== ''
  }

  function authenticate(token: string) {
    storeToken(token)
    getUser()
  }

  async function getUser(force: boolean = false) {
    if (!user || force) {
      const user = await users.getUser(token).then(user => {
        setUser(user)
        return user
      }).catch(error => {
        if(error.response && error.response.status === 401 && token !== '') {
          logout()
        }
      })
      return user
    }
    return user
  }

  function logout (): void {
    deleteToken()
    window.location.href = HYDRA_LOGIN_GRANT_URL
  }

  return (
    <div className="w-full">
      <Router>
        <AuthContext.Provider value={{ token, deleteToken, getUser, handleAuthError: logout }}>
          <Header logout={logout}/>
          <div className="container mx-auto">
          <Switch>
            <PrivateRoute isAuthenticated={isAuthenticated} path="/" exact component={Home} />
            <PrivateRoute isAuthenticated={isAuthenticated} path="/settings" exact component={UserSettings} />
            <PrivateRoute isAuthenticated={isAuthenticated} path="/accounts/create" component={CreateAccount} />
            <PrivateRoute isAuthenticated={isAuthenticated} path="/accounts/:id" component={ShowAccount} />
            <PrivateRoute isAuthenticated={isAuthenticated} exact path="/agreements" component={Agreements} />
            <PrivateRoute isAuthenticated={isAuthenticated} exact path="/agreements/:id" component={ShowAgreement} />
            <PrivateRoute isAuthenticated={isAuthenticated} exact path="/oauth2/clients/create" component={OauthRegistration}/>
            <Route path="/callback" exact  render={(props) => <Callback  authenticate={authenticate} {...props}/>}/>
            <Route path="/signup" exact  render={(props) => <Signup  authenticate={authenticate} {...props}/>}/>
            <Route path="/login" exact  render={(props) => <Login authenticate={authenticate} {...props}/>}/>}/>
            <Route path="/consent" exact  render={(props) => <Consent authenticate={authenticate} {...props}/>}/>

            <Route path="/payment-handler" exact render={(props) => <Checkout {...props}/>}/>

          </Switch>
          </div>
        </AuthContext.Provider>
      </Router>
    </div>
  );
}

export default App;

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }: any) => (
  <Route {...rest} render={(props) => (
    isAuthenticated()
      ? <Component {...props} {...rest} />
      : <Redirect to="/login" />
  )} />
);
