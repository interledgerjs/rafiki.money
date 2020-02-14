import { NextPage } from "next"
import { destroyCookie } from 'nookies'
import { UsersService } from '../services/users'
import getConfig from 'next/config'

const usersService = UsersService()
const { publicRuntimeConfig } = getConfig()

const Logout: NextPage = () => {
  return null
}

Logout.getInitialProps = async (ctx) => {
  const { logout_challenge } = ctx.query

  const LOGOUT_URL = publicRuntimeConfig.OAUTH_URL + '/oauth2/sessions/logout'

  if(!logout_challenge) {
    ctx.res.writeHead(302, {
      Location: LOGOUT_URL
    })
    ctx.res.end()
  }

  // Check consentChallenge to see if it can be skipped.
  const logout = await usersService.handleLogout(logout_challenge.toString())

  if(logout && logout.redirectTo) {
    destroyCookie(ctx, 'token')
    ctx.res.writeHead(302, {
      Location: logout.redirectTo
    })
    ctx.res.end()
  }

  return {}
}

export default Logout
