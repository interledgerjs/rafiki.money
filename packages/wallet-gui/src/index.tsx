import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import * as serviceWorker from './serviceWorkers/serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async function() {
    const registration = await navigator.serviceWorker.register('/sw.js')

    //@ts-ignore
    if (!registration.paymentManager) return;

    //@ts-ignore
    registration.paymentManager.instruments.set(
      // Payment instrument key can be any string.
      "interledger",
      // Payment instrument detail
      {
        name: 'Wallet',
        method: 'interledger'
      }
    )

    //@ts-ignore
    registration.paymentManager.instruments.set(
      // Payment instrument key can be any string.
      "rafiki-money",
      // Payment instrument detail
      {
        name: 'Rafiki Money',
        method: 'https://rafiki.money'
      }
    )
    //@ts-ignore
    console.log(registration.paymentManager.instruments)
})
}
