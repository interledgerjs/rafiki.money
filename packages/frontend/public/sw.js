let methodName = 'http://localhost:3000/'
let checkoutURL = ''
let resolver
let payment_request_event
let minimalUI = true

self.addEventListener('canmakepayment', e => {
  console.log('canMakePayment event: ', e)
  if (e.respondWithMinimalUI && e.currency) { 
    return e.respondWithMinimalUI({
      canMakePayment: true,
      readyForMinimalUI: e.currency === 'USD',
      accountBalance: '15.00',
    })
  } else {
    minimalUI = false
    console.log('Minimal UI feature is not enabled. Is ' + 'chrome://flags/#enable-web-payments-minimal-ui flag enabled?')
    e.respondWith(true)
  }
})

self.addEventListener('paymentrequest', e => {
  if (minimalUI) {
    e.respondWith({
      methodName: methodName,
      details: {
        token: '1234567890',
      },
    })
  } else {
    payment_request_event = e
    console.log('A->', e)
    console.log('B->', getMethodData( e, methodName))
    checkoutURL = `${methodName}checkout?name=${e.methodData[0].data.invoice.name}`

    resolver = new PromiseResolver()

    e.respondWith(resolver.promise)

    e.openWindow(checkoutURL).then(client => {
      console.log('opening window')
      if (client === null) {
        resolver.reject(`Failed to open window (${checkoutURL})`)
      }
    }).catch(err => {
      resolver.reject(err)
    })
  }
})

self.addEventListener('message', e => {
  console.log('A message received:', e)
  if (e.data === "payment_app_window_ready") {
    sendPaymentRequest()
    return
  } else if (e.data === "invoice_ready") {
    checkoutURL += ''
  } else if (e.data === "The payment request is cancelled by user") {
    console.log('payment cancelled')
    resolver.reject(e.data)
  } else if (e.data && e.data.methodName === methodName) {
    try {
      resolver.resolve(e.data)
    } catch (error) {
      console.log('caught error', error)
      resolver.reject(error)
    }
  } else {
    resolver.reject(e.data)
  }
})

const sendPaymentRequest = () => {
  if (!payment_request_event) return
  clients.matchAll({
    includeUncontrolled: false,
    type: 'window'
  }).then(clientList => {
    for (let client of clientList) {
      client.postMessage(payment_request_event.total)
    }
  })
}

const getMethodData = (e, methodName) => {
  if(e.methodData && e.methodData.length) {
    for(let i = 0; i < e.methodData.length; i++) {
      if(e.methodData[i].supportedMethods === methodName) {
        return e.methodData[i].data
      }
    }
  }
  console.log('no method data')
  return undefined
}

function PromiseResolver() {

  /** @private {function(T=): void} */
  this.resolve_ = undefined

  /** @private {function(*=): void} */
  this.reject_ = undefined

  /** @private {!Promise<T>} */
  this.promise_ = new Promise(function(resolve, reject) {
    this.resolve_ = resolve
    this.reject_ = reject
  }.bind(this))
}

PromiseResolver.prototype = {

  /** @return {!Promise<T>} */
  get promise() {
    return this.promise_
  },

  /** @return {function(T=): void} */
  get resolve() {
    return this.resolve_
  },

  /** @return {function(*=): void} */
  get reject() {
    return this.reject_
  }
}
