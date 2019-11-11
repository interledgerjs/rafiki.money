const proxy = require('http-proxy-middleware')
module.exports = function (app) {
  app.use('/api/users', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/consent', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/login', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/accounts', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/transactions', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/mandates', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
  app.use('/api/oauth2/clients', proxy({ target: 'https://rafiki.money', changeOrigin: true, }))
}
