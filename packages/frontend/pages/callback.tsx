import React from 'react'
import { NextPage } from "next"
import ky from 'ky-universal'
import qs from 'querystring'
import { setCookie } from 'nookies'

const HYDRA_TOKEN_ENDPOINT = process.env.HYDRA_TOKEN_ENDPOINT || 'http://localhost:9000/oauth2/token'
const HYDRA_REDIRECT_URI = process.env.HYDRA_REDIRECT_URI || 'http://localhost:3000/callback'
const HYDRA_CLIENT_ID = process.env.HYDRA_CLIENT_ID || 'frontend-client'

const Callback: NextPage = () => {
  return (
    null
  )
}

Callback.getInitialProps = async (ctx) => {
  const {code} = ctx.query

  if (!code) {
    ctx.res.writeHead(302, {
      Location: '/'
    })
    ctx.res.end()
  }

  const tokenInfo = await ky.post(HYDRA_TOKEN_ENDPOINT, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify({
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: HYDRA_REDIRECT_URI,
      client_id: HYDRA_CLIENT_ID,
    })
  }).then(async resp => {
    return resp.json()
  }).catch(error => {
    console.log(error.response)
    throw error
  })

  setCookie(ctx, 'token', tokenInfo.access_token, {})

  ctx.res.writeHead(302, {
    Location: '/'
  })
  ctx.res.end()
  return {}
}

export default Callback
