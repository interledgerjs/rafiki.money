const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const cors = require('koa-cors')
const axios = require('axios')
const ilpPacket = require('ilp-packet')
const HYDRA_ADMIN_URL = process.env.HYDRA_ADMIN_URL || ''
const getRawBody = require('raw-body')
const fs = require('fs')

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()

  server.use(async (ctx, next) => {
    if (ctx.path === '/ilp') ctx.disableBodyParser = true;
    await next();
  })

  server.use(bodyParser())
  server.use(cors())

  router.get('/health', async ctx => {
    ctx.statusCode = 200
  })

  router.post('/ilp', async ctx => {
    const prepareBuffer = await getRawBody(ctx.req)
    const packet = ilpPacket.deserializeIlpPrepare(prepareBuffer)
    const fulfillment = packet.data

    ctx.body = ilpPacket.serializeIlpFulfill({
      fulfillment,
      data: Buffer.from('')
    })
  })

  router.get('/callback', async ctx => {
    const query = ctx.request.query
    const code = query['code']
    const clientId = query['clientId']
    const callbackUrl = query['callbackUrl']

    return app.render(ctx.req, ctx.res, '/callback', { code, clientId, callbackUrl })
  })

  router.post('/clients', async ctx => {
    try {
      await axios.post(`${HYDRA_ADMIN_URL}/clients`, ctx.request.body, { headers: ctx.request.headers })
      ctx.response.status = 200
    } catch (error) {
      if (error.response.status === 409) {
        ctx.response.status = 200
      } else {
        console.log('error response', error.response.statusText)
        ctx.response.status = error.response.status
      }
    }
  })

  router.get('/gatehub', async ctx => {
    ctx.type = 'html';
    ctx.body = fs.createReadStream('./public/index.html');
    return
  })

  router.post('/agreements', async ctx => {
    const mandatesEndpoint = ctx.request.query['payment_mandates_endpoint']
    const agreement = await axios.post(mandatesEndpoint, ctx.request.body, { timeout: 5000 }).then(res => res.data)
    ctx.body = agreement
  })

  router.get('*', async ctx => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())

  server.listen(port, '0.0.0.0' , () => {
    console.log(`> Ready on http://localhost:${port}.`)
  })
})
