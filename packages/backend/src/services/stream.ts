import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import BtpPlugin from 'ilp-plugin-btp'
import { Connection, createConnection, DataAndMoneyStream, Server } from 'ilp-protocol-stream'
import base64url from 'base64url'
import { Logger } from 'pino'
import { Invoice } from '../models/invoice'
import { InvoiceTransaction } from '../models/invoiceTransaction'
import { Transaction } from 'objection'

const BTP_UPLINK = process.env.BTP_UPLINK || 'btp+ws://:secret@localhost:7770/accounts/stream/ilp/btp'

export type StreamServiceOptions = {
  key: string
  plugin: BtpPlugin
  logger: Logger
}

export class StreamService {
  private logger: Logger
  private readonly key: Buffer
  streamServer: Server

  constructor (opts: StreamServiceOptions) {
    this.logger = opts.logger
    this.key = Buffer.from(opts.key)
    this.streamServer = new Server({
      serverSecret: randomBytes(32),
      plugin: opts.plugin
    })
    this.setupStream()
  }

  encodeConnectionTag (data: string) {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.key, iv)
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ])

    const tag = cipher.getAuthTag()
    const complete = Buffer.concat([
      tag,
      iv,
      encrypted
    ])

    return base64url(complete)
  }

  decodeConnectionTag (completeEncoded: string) {
    const complete = Buffer.from(completeEncoded, 'base64')
    const tag = complete.slice(0, 16)
    const iv = complete.slice(16, 16 + 12)
    const encrypted = complete.slice(16 + 12)

    const decipher = createDecipheriv('aes-256-gcm', this.key, iv)
    decipher.setAuthTag(tag)

    const data = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return data.toString('utf8')
  }

  setupStream () {
    this.streamServer.on('connection', async (conn: Connection) => {
      this.logger.trace('Got connection')
      if (!conn.connectionTag) {
        await conn.end()
        return
      }
      const data = JSON.parse(this.decodeConnectionTag(conn.connectionTag))

      const invoice = await Invoice.query().findById(data.invoiceId)

      if (!invoice) {
        await conn.end()
        return
      }

      conn.on('stream', async (stream: DataAndMoneyStream) => {

        // Todo, potentially limit this to the amount still needed for the Invoice.
        //  This would mean only a singular Invoice can be paid at once
        stream.setReceiveMax(String(2 ** 56))

        stream.on('money', async amount => {
          await Invoice.transaction(async (trx: Transaction) => {
            const inv = await Invoice.query(trx).findById(invoice.id).forUpdate()
            await Invoice.query(trx).where('id', inv.id).patch({
              received: inv.received += BigInt(amount)
            })
            await InvoiceTransaction.query(trx).insert({
              invoiceId: invoice.id,
              amount: amount
            })
          })
        })

        stream.on('error', (err) => {
          this.logger.warn('stream error', { err: err })
        })
      })

      conn.on('error', (err: Error) => {
        this.logger.warn('connection error', { err: err })
      })
    })
  }

  async sendMoney (ilpAddress: string, sharedSecret: string, amount: string): Promise<number> {
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

  generateStreamCredentials (invoiceId: string) {
    const data = {
      invoiceId
    }
    const connectionTagData = this.encodeConnectionTag(JSON.stringify(data))

    const { destinationAccount, sharedSecret } = this.streamServer.generateAddressAndSecret(connectionTagData)

    return {
      ilpAddress: destinationAccount,
      sharedSecret: sharedSecret
    }
  }

  async listen () {
    await this.streamServer.listen()
  }

  async close () {
    await this.streamServer.close()
  }
}
