const Connector = require('ilp-connector')

const connector = Connector.createApp({
  spread: 0,
  backend: 'ecb-plus-xrp',
  ilpAddress: 'test.rafikilocal',
  initialConnectTimeout: 60000,
  accounts: {
    stream: {
      relation: 'child',
      sendRoutes: false,
      receiveRoutes: false,
      plugin: 'ilp-plugin-mini-accounts',
      assetCode: 'USD',
      assetScale: 6,
      options: {
        port: 8000
      }
    },
  }
})

connector.listen()
  .catch(err => {
    const errInfo = (err && typeof err === 'object' && err.stack) ? err.stack : err
    console.error(errInfo)
  })
