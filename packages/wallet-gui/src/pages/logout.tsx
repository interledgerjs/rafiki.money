import React, { useEffect } from 'react'
import { UsersService } from '../services/users'
import { RouteComponentProps } from 'react-router'


const Logout: React.FC<RouteComponentProps> = (props) => {
  const users = UsersService()

  useEffect(() => {
    getHydraGrantRequest()
  }, [])

  async function getHydraGrantRequest() {
    const url = new URL(window.location.href)
    const urlChallenge = url.searchParams.get('logout_challenge')
    console.log('logoutChallenge', urlChallenge)
    if (!urlChallenge) {
      window.location.href = 'https://auth.rafiki.money/oauth2/sessions/logout'
    } else {
      const logout = await users.handleLogout(urlChallenge)
      if(logout && logout.redirectTo) {
        window.localStorage.removeItem('token')
        window.location.href = logout.redirectTo
      }
    }
  }

  return (
    <div>

    </div>
  )
}

export default Logout;
