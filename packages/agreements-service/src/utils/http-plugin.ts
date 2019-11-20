import { EventEmitter } from 'events'
import axios from 'axios'

type PacketHandler = (data: Buffer) => Promise<Buffer>

export class HttpPlugin extends EventEmitter {
  private _connected: boolean
  private _dataHandler?: PacketHandler

  constructor (private _outgoingUrl: string, private _outgoingAuthToken: string) {
    super()
  }

  async connect (): Promise<void> {
    if (this._connected) return
    this._connected = true
    this.emit('connect')
  }

  async disconnect (): Promise<void> {
    if (!this._connected) return

    this._connected = false
    this.emit('disconnect')
  }

  async sendData (data: Buffer): Promise<Buffer> {
    if (!this._connected) {
      throw new Error('plugin is not connected.')
    }

    return axios.post(this._outgoingUrl, data, {
      responseType: 'arraybuffer',
      headers: {
        'content-type': 'application/octet-stream',
        authorization: `Bearer ${this._outgoingAuthToken}`
      }
    }).then(response => response.data)
  }

  // boilerplate methods
  isConnected (): boolean {
    return this._connected
  }

  registerDataHandler (handler: PacketHandler) {
    this._dataHandler = handler
  }

  deregisterDataHandler (): void {
    delete this._dataHandler
  }

  registerMoneyHandler (): void {

  }

  deregisterMoneyHandler (): void {
  }

  async sendMoney (): Promise<void> {

  }
}
