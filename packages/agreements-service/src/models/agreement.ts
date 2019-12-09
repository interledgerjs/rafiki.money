import { BaseModel } from './baseModel'
import { Pojo } from 'objection'
import { createHmac } from 'crypto'

export class Agreement extends BaseModel {
  static get tableName(): string {
    return 'agreements'
  }

  assetCode!: string
  assetScale!: number
  amount!: string
  description!: string
  start!: number
  expiry!: number
  interval!: string
  cycles!: number
  cap!: boolean
  userId!: number
  accountId!: number
  subject!: string
  secret!: string
  secretSalt!: string
  scope!: string
  callback!: string
  type!: string
  cancelledAt!: number

  isMandate(): boolean {
    return this.type === 'mandate'
  }

  get secretHash(): string | undefined {
    if (this.secret && this.secretSalt) {
      return createHmac('SHA256', this.secretSalt)
        .update(this.secret)
        .digest('base64')
    }

    return undefined
  }

  $formatJson(): Pojo {
    return {
      id: this.id,
      asset: {
        code: this.assetCode,
        scale: this.assetScale
      },
      description: this.description || undefined,
      userId: this.userId || undefined,
      accountId: this.accountId || undefined,
      subject: this.subject || undefined,
      amount: this.amount || undefined,
      start: this.start || undefined,
      expiry: this.expiry || undefined,
      interval: this.interval || undefined,
      cycles: this.cycles || undefined,
      cap: this.cap || undefined,
      secretSalt: this.secretSalt || undefined,
      secretHash: this.secretHash || undefined,
      scope: this.scope || undefined,
      callback: this.callback || undefined,
      cancelledAt: this.cancelledAt || undefined
    }
  }
}
