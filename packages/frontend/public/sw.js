let methodName = 'https://openpayments.dev/pay'
let checkoutURL = 'https://rafiki.money/checkout'
let resolver
let payment_request_event
let minimalUI = false

const USERS_API_URL = 'https://rafiki.money/api/'

const getBalance = async () => {
  let token = await cookieStore.get('token')
  console.log('token', token)
  const request = new Request(`${USERS_API_URL}users/me/balance`, { method: 'GET', headers: new Headers({ 'authorization': `Bearer ${token.value}` }) })
  self.fetch(request).then(response => {
    console.log(response)
    if (response.status === 200) {
      return response.json()
    } else {
      throw new Error('Something went wrong on api server!');
    }
  }).then(response => {
    return response.balance
  }).catch(error => {
    console.error(error)
  })
}

const payInvoice  = async (invoice) => {
  let token = await cookieStore.get('token')
  let body = new FormData()
  body.append('invoice', invoice.id)
  body.append('accountId', invoice.accountId)
  body.append('amount', invoice.amount)
  const request = new Request(`${USERS_API_URL}payments/invoice`, { method: 'POST', body: body, headers: new Headers({ 'authorization': `Bearer ${token.value}` }) })
  self.fetch(request).then(response => {
    console.log(response)
    if (response.status === 200) {
      return response.json()
    } else {
      throw new Error('Something went wrong on api server!');
    }
  }).then(response => {
    return response
  }).catch(error => {
    console.error(error)
  })
}

self.addEventListener('canmakepayment', async e => {
  console.log('canMakePayment event: ', e)
  let balance = await getBalance()
  if (e.methodData[0].data.invoice.amount > balance) return e.respondWith(false)
  console.log('balance - invoice.amount', balance, e.methodData[0].data.invoice.amount)
  if (e.respondWithMinimalUI && e.currency) { 
    minimalUI = true
    return e.respondWithMinimalUI({
      canMakePayment: true,
      readyForMinimalUI: e.currency === 'USD',
      accountBalance: balance,
    })
  } else {
    console.log('Minimal UI feature is not enabled. Is ' + 'chrome://flags/#enable-web-payments-minimal-ui flag enabled?')
    e.respondWith(true)
  }
})

self.addEventListener('paymentrequest', async e => {
  if (minimalUI) {
    console.log('Payment request:', e.methodData[0].data.invoice)
    // e.respondWith({
    //   methodName: methodName,
    //   details: {
    //     success: true,
    //   },
    // })
    let paid = await payInvoice(e.methodData[0].data.invoice)
    if (paid) {
      e.respondWith({
        methodName: methodName,
        details: {
          success: true,
        },
      })
    } else {
      e.respondWith({
        methodName: methodName,
        details: {
          success: false,
        },
      })
    }
  } else {
    payment_request_event = e
    console.log('A->', e)
    console.log('B->', getMethodData( e, methodName))
    checkoutURL = `${checkoutURL}?name=${e.methodData[0].data.invoice.name}`

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

// Force the SW to be activated immediately
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

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
