const got = require('got')
const crypto = require('crypto')
const stream = require('ilp-protocol-stream')
const BtpPlugin = require('ilp-plugin-btp')

const BTP_UPLINK = 'btp+ws://localhost:8000'

const sendMoney = async (invoice, amount) => {

  const invoiceUrl = 'http:' + invoice
  const paymentDetails = await got(invoiceUrl, {
    method: 'OPTIONS'
  }).json()

  const btpToken = crypto.randomBytes(16).toString('hex')
  const client = new BtpPlugin({
    server: BTP_UPLINK,
    btpToken
  })

  const connection = await stream.createConnection({
    destinationAccount: paymentDetails.ilpAddress,
    sharedSecret: Buffer.from(paymentDetails.sharedSecret, 'base64'),
    plugin: client
  })

  const s = await connection.createStream()

  return new Promise(async (resolve) => {
    await s.sendTotal(amount)
    await s.end()
    await connection.end()
    const total = s.totalSent
    await connection.destroy()
    resolve(Number(total))
  })
}

sendMoney('//localhost:3001/invoices/e5f83c51-ac29-43a8-a62a-416b05c60525', 1000).then((amount) => {
  console.log('Sent', amount)
}).catch(error => {
  console.log(error)
})
