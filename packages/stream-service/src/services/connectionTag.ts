import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
import base64url from 'base64url'

export class ConnectionTag {
  private readonly key: Buffer

  constructor (key: string) {
    this.key = Buffer.from(key)
  }

  encode (data: string) {
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

  decode (completeEncoded: string) {
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
}
