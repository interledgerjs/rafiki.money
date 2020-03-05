// // TODO - Figure out how to write this in Typescript and compile it with the rest of the code

// /* eslint-disable no-restricted-globals */
// const PURSE_PAYMENT_METHOD_ID = 'https://rafiki.money'
// const INTERLEDGER_PAYMENT_METHOD_ID = 'interledger'

// // TODO - dictionary indexed by payment request id? Yeah maybe need something to help deal with concurrent requests
// let paymentRequest = undefined

// self.addEventListener('install', async (e) => {
//   console.log('install SW')
// })

// self.addEventListener('activate', async (e) => {
//   // Perform post-install steps now that this is the main sw
//   console.log('Activate SW')
// })

// self.addEventListener('canmakepayment', async (e) => {
//   console.log('can make payment?')
//   if (e.respondWith2 && e.currency) {
//     return e.respondWith2({
//       canMakePayment: true,
//       readyForMicrotransaction: e.currency === 'USD',
//       accountBalance: '18.00',
//     });
//   } else {
//     // Does the PR have supported methods?
//     const interledgerData = getMethodData(e, INTERLEDGER_PAYMENT_METHOD_ID)
//     const purseData = getMethodData(e, PURSE_PAYMENT_METHOD_ID)
//     e.respondWith(interledgerData !== undefined || purseData !== undefined)
//   }
// })

// self.addEventListener('paymentrequest', async function(e) {
//   console.log(e)

//   paymentRequest = new PaymentRequestPromise()
//   e.respondWith(paymentRequest.promise)

//   const methodData = getMethodData(e, 'interledger')
//   // TODO - Get data for 'https://paywithpurse.com/'

//   // TODO - Handle `methodData` is undefined
//   // TODO - Validate `methodData`

//   /**
//    * Convert PaymentRequest data into URI params for Pay with Purse
//    * {
//    *   paymentRequest?: {
//    *     id: string,
//    *     origin: string,
//    *     instrumentKey: string,
//    *     total:
//    *   },
//    *   mandate?: {
//    *     amount: string,
//    *     assetCode: string,
//    *     assetScale: int
//    *   }
//    * }
//    */

//   const requestData = {
//     paymentRequest: {
//       id: e.paymentRequestId,
//       origin: e.paymentRequestOrigin,
//       topOrigin: e.topOrigin,
//       instrumentKey: e.instrumentKey,
//       total: e.total,
//     },
//     mandate: methodData.mandate,
//     merchantInfo: methodData.merchantInfo
//   }

//   try {
//     const client = await e.openWindow(`/payment-handler?request=${encodeURI(JSON.stringify(requestData))}`)
//     if(!client) {
//       paymentRequest.reject('Failed to open window');
//     }
//     // TODO - Catch window close before we get the response
//   } catch (e) {
//     paymentRequest.reject(e);
//   }

// })

// self.addEventListener('message', (e) => {
//   console.log('message:', e)
//   if(paymentRequest === undefined) {
//     //TODO - We've got a message but no way to respond to the payment request, should we kill the sw
//     console.error('No Payment Request to respond to.', e)
//     return
//   }
//   if(e.data && e.data.methodName) {
//     paymentRequest.resolve(e.data);
//   } else {
//     paymentRequest.reject(e.data);
//   }
// });

// function getMethodData(e, methodName) {
//   if(e.methodData && e.methodData.length) {
//     for(let i = 0; i < e.methodData.length; i++) {

//       if(e.methodData[i].supportedMethods === methodName) {
//         return e.methodData[i].data
//       }
//     }
//   }
//   return undefined
// }

// function PaymentRequestPromise() {// function getMethodData(e, methodName) {
//   if(e.methodData && e.methodData.length) {
//     for(let i = 0; i < e.methodData.length; i++) {

//       if(e.methodData[i].supportedMethods === methodName) {
//         return e.methodData[i].data
//       }
//     }
//   }
//   return undefined
// }

// function PaymentRequestPromise() {

//   /** @private {function(T=): void} */
//   this.resolve_ = undefined

//   /** @private {function(*=): void} */
//   this.reject_ = undefined

//   /** @private {!Promise<T>} */
//   this.promise_ = new Promise(function(resolve, reject) {
//     this.resolve_ = resolve
//     this.reject_ = reject
//   }.bind(this))
// }

// PaymentRequestPromise.prototype = {

//   /** @return {!Promise<T>} */
//   get promise() {
//     return this.promise_
//   },

//   /** @return {function(T=): void} */
//   get resolve() {
//     return this.resolve_
//   },

//   /** @return {function(*=): void} */
//   get reject() {
//     return this.reject_
//   }
// }

//   /** @private {function(T=): void} */
//   this.resolve_ = undefined

//   /** @private {function(*=): void} */
//   this.reject_ = undefined

//   /** @private {!Promise<T>} */
//   this.promise_ = new Promise(function(resolve, reject) {
//     this.resolve_ = resolve
//     this.reject_ = reject
//   }.bind(this))
// }

// PaymentRequestPromise.prototype = {

//   /** @return {!Promise<T>} */
//   get promise() {
//     return this.promise_
//   },

//   /** @return {function(T=): void} */
//   get resolve() {
//     return this.resolve_
//   },

//   /** @return {function(*=): void} */
//   get reject() {
//     return this.reject_
//   }
// }

const origin = 'http://localhost:3000';
const methodName = `${origin}`;
let checkoutURL = `${origin}/checkout`;
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
    const rafikiData = getMethodData( e, 'test')
    e.respondWith(rafikiData !== undefined)
  }
})

self.addEventListener('paymentrequest', e => {
  // Preserve the event for future use
  payment_request_event = e;
  console.log('A->', e)

  console.log('B->',getMethodData( e, 'test'))

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
