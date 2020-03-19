import { AppContext } from '../app'
import { createConnection } from 'ilp-protocol-stream'
import BtpPlugin from 'ilp-plugin-btp'
import { randomBytes } from 'crypto'

const BTP_UPLINK = process.env.BTP_UPLINK || 'btp+ws://:secret@localhost:7770/accounts/stream/ilp/btp'

const sendMoney = async (ilpAddress: string, sharedSecret: string, amount: string): Promise<number> => {
  const btpToken = randomBytes(16).toString('hex')
  const client = new BtpPlugin({
    server: BTP_UPLINK,
    btpToken
  })

  const connection = await createConnection({
    destinationAccount: ilpAddress,
    sharedSecret: Buffer.from(sharedSecret),
    plugin: client
  })

  const stream = await connection.createStream()

  return new Promise((resolve) => {
    let totalAmount: 0
    const onOutgoingMoney = (amount: string) => {
      totalAmount += Number(amount)
    }

    const cleanUp = () => {
      setImmediate(() => {
        stream.removeListener('error', cleanUp)
        stream.removeListener('close', cleanUp)
        stream.removeListener('outgoing_money', onOutgoingMoney)
        connection.removeListener('error', cleanUp)
        connection.removeListener('close', cleanUp)

        client.disconnect()
        stream.destroy()
        connection.destroy()
        resolve(totalAmount)
      })
    }

    stream.on('error', cleanUp)
    stream.on('close', cleanUp)
    stream.on('outgoing_money', onOutgoingMoney)
    connection.on('error', cleanUp)
    connection.on('close', cleanUp)
    stream.setSendMax(amount)
  })
}

export async function create (ctx: AppContext): Promise<void> {
  const { logger } = ctx
  const { body } = ctx.request
  logger.info('Paying STREAM credentials')

  await sendMoney(body.ilpAddress, body.sharedSecret, body.amount)

  ctx.status = 200
}
