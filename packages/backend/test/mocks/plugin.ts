import { EventEmitter } from 'events'
import * as IlpPacket from 'ilp-packet'
import * as ILDCP from 'ilp-protocol-ildcp'
import { Writer } from 'oer-utils'

export interface DataHandler {
  (data: Buffer): Promise<Buffer>
}
export interface MoneyHandler {
  (amount: string): Promise<void>
}

export default class MockPlugin extends EventEmitter {
  static readonly version = 2
  public dataHandler: DataHandler
  public moneyHandler: MoneyHandler
  public exchangeRate: number
  public connected: boolean
  public mirror: MockPlugin
  protected identity: string
  protected assetCode: string
  public maxAmount?: number

  constructor (mirror?: MockPlugin) {
    super()

    this.dataHandler = this.defaultDataHandler
    this.moneyHandler = this.defaultMoneyHandler
    this.mirror = mirror || new MockPlugin(this)
    this.identity = (mirror ? 'peerB' : 'peerA')
    this.assetCode = (mirror ? 'USD' : 'XRP')
    this.maxAmount = 100000
  }

  async connect () {
    this.connected = true
    return Promise.resolve()
  }

  async disconnect () {
    this.emit('disconnect')
    this.connected = false
    return Promise.resolve()
  }

  isConnected () {
    return this.connected
  }

  async sendData (data: Buffer): Promise<Buffer> {
    if (data[0] === IlpPacket.Type.TYPE_ILP_PREPARE) {
      const parsed = IlpPacket.deserializeIlpPrepare(data)
      if (parsed.destination === 'peer.config') {
        return ILDCP.serializeIldcpResponse({
          clientAddress: 'test.' + this.identity,
          assetScale: 6,
          assetCode: this.assetCode
        })
      }
      const amount = Number(parsed.amount)
      if (this.maxAmount !== undefined && (amount >= this.maxAmount)) {
        // const writer = new Writer()
        // writer.writeUInt64(amount)
        // writer.writeUInt64(this.maxAmount)
        return IlpPacket.serializeIlpReject({
          code: 'F08',
          message: 'Packet amount too large',
          triggeredBy: 'test.connector',
          data: Buffer.from('')
        })
      }
      const newPacket = IlpPacket.serializeIlpPrepare({
        ...parsed,
        amount: amount.toString()
      })
      return this.mirror.dataHandler(newPacket)
    } else {
      return this.mirror.dataHandler(data)
    }
  }

  async sendMoney (amount: string): Promise<void> {
    return this.mirror.moneyHandler(amount)
  }

  registerDataHandler (handler: DataHandler): void {
    this.dataHandler = handler
  }

  deregisterDataHandler (): void {
    this.dataHandler = this.defaultDataHandler
  }

  registerMoneyHandler (handler: MoneyHandler): void {
    this.moneyHandler = handler
  }

  deregisterMoneyHandler (): void {
    this.moneyHandler = this.defaultMoneyHandler
  }

  async defaultDataHandler (data: Buffer): Promise<Buffer> {
    return IlpPacket.serializeIlpReject({
      code: 'F02', // Unreachable
      triggeredBy: 'example.mock-plugin',
      message: 'No data handler registered',
      data: Buffer.alloc(0)
    })
  }

  async defaultMoneyHandler (amount: string): Promise<void> {
    return Promise.resolve()
  }
}
