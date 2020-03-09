const methodName = 'http://localhost:3000';
let checkoutURL = '';
let resolver;
let payment_request_event;

self.addEventListener('canmakepayment', async (e) => {
  console.log('can make payment called')
  if (e.respondWith2 && e.currency) {
    return e.respondWith2({
      canMakePayment: true
    });
  } else {
    // Does the PR have supported methods?
    const rafikiData = getMethodData( e, methodName)
    e.respondWith(rafikiData !== undefined)
  }
})

self.addEventListener('paymentrequest', e => {
  // Preserve the event for future use
  payment_request_event = e;
  console.log('A->', e)

  console.log('B->',getMethodData( e, methodName))
  checkoutURL = `${methodName}/checkout?name=${e.methodData[0].data.invoice.name}`

  // You'll need a polyfill for `PromiseResolver`
  // As it's not implemented in Chrome yet.
  resolver = new PromiseResolver();

  e.respondWith(resolver.promise);

  // try {
    e.openWindow(checkoutURL).then(client => {
      console.log('opening window')
      if (client === null) {
        resolver.reject(`Failed to open window (${checkoutURL})`);
      }
    }).catch(err => {
      resolver.reject(err);
    });


  //   const client = await e.openWindow(checkoutURL)
  //   if(!client) {
  //     resolver.reject(`Failed to open window: ${checkoutURL}`)
  //   }

  // } catch (error) {
  //   resolver.reject(error)
  // }
});

self.addEventListener('message', e => {
  console.log('A message received:', e);
  if (e.data === "payment_app_window_ready") {
    sendPaymentRequest();
    return;
  } else if (e.data === "invoice_ready") {
    checkoutURL += ''
  } else if (e.data === "The payment request is cancelled by user") {
    resolver.resolve(e.data)
    return
  }

  if (e.data.methodName === methodName) {
    resolver.resolve(e.data);
  } else {
    resolver.reject(e.data);
  }
});

const sendPaymentRequest = () => {
  if (!payment_request_event) return;
  clients.matchAll({
    includeUncontrolled: false,
    type: 'window'
  }).then(clientList => {
    for (let client of clientList) {
      client.postMessage(payment_request_event.total);
    }
  });
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
