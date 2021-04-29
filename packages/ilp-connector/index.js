const Connector = require('ilp-connector')

const UPLINK_SERVER = process.env.UPLINK_SERVER || "btp+wss://GsY5wdYWgOvykG2KMlBZVQqdH57aYcAwNFVJ86PXLmU:e42e32b920f92da77f85c9e9b6837e7b@us1.rafiki.money/btp"

const connector = Connector.createApp({
  spread: 0,
  backend: 'ecb-plus-xrp',
  initialConnectTimeout: 60000,
  accounts: {
    uplink: {
      relation: 'parent',
      sendRoutes: false,
      receiveRoutes: false,
      plugin: 'ilp-plugin-btp',
      assetCode: 'XRP',
      assetScale: 6,
      options: {
        server: UPLINK_SERVER
      }
    },
    local: {
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
