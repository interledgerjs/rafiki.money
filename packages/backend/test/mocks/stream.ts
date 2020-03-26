import { Server } from 'ilp-protocol-stream'
import { Plugin } from 'ilp-protocol-stream/dist/src/util/plugin-interface'
import { ConnectionOpts } from 'ilp-protocol-stream/dist/src/connection'
import * as cryptoHelper from 'ilp-protocol-stream/dist/src/crypto'
import { randomBytes } from 'crypto'

const CONNECTION_ID_REGEX = /^[a-zA-Z0-9~_-]+$/

function base64url (buffer: Buffer) {
  return buffer.toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export class StreamServerMock extends Server {
  protected connected = true
  protected connectionOpts: ConnectionOpts
  protected log: any
  readonly assetCode: string
  readonly assetScale: number
  protected plugin: Plugin
  protected serverAccount: string
  protected serverAssetCode: string
  protected serverAssetScale: number
  protected serverSecret: Buffer

  constructor () {
    super({} as any)
    this.serverSecret = randomBytes(32)
    this.serverAccount = 'test.stream'
    this.serverAssetCode = 'USD'
    this.serverAssetScale = 6
  }

  close (): Promise<void> {
    return Promise.resolve()
  }

  generateAddressAndSecret (connectionTag?: string): { destinationAccount: string; sharedSecret: Buffer } {
    if (!this.connected) {
      throw new Error('Server must be connected to generate address and secret')
    }
    let token = base64url(cryptoHelper.generateToken())
    if (connectionTag) {
      if (!CONNECTION_ID_REGEX.test(connectionTag)) {
        throw new Error('connectionTag can only include ASCII characters a-z, A-Z, 0-9, "_", "-", and "~"')
      }
      token = token + '~' + connectionTag
    }
    const sharedSecret = cryptoHelper.generateSharedSecretFromToken(this.serverSecret, Buffer.from(token, 'ascii'))
    return {
      destinationAccount: `${this.serverAccount}.${token}`,
      sharedSecret
    }
  }

  listen (): Promise<void> {
    return Promise.resolve()
  }
}
