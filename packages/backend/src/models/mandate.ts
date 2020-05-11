import { Model, UniqueViolationError } from 'objection'
import { v4 } from 'uuid'
import { Charge, ChargeInfo } from './charge'
import { MandateTransaction } from './mandateTransaction'
import { toSeconds, parse } from 'iso8601-duration'
import { MandateInterval } from './mandateInterval'
const OpenPaymentsIssuer = process.env.OPEN_PAYMENTS_ISSUER || 'localhost'

export type MandateInfo = {
  id: string;
  name: string;
  userId: number;
  accountId: number;
  description: string;
  assetCode: string;
  assetScale: number;
  amount: string;
  balance: string;
  startAt: string;
  expireAt: string;
  interval: string;
  cap: boolean;
  scope: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string;
  charges: Partial<ChargeInfo>[]
}

export class Mandate extends Model {
  static get tableName (): string {
    return 'mandates'
  }

  id: string;
  userId!: number;
  accountId!: number;
  description!: string;
  assetCode: string;
  assetScale: number;
  amount: bigint;
  balance !: bigint;
  startAt !: string;
  expireAt !: string;
  scope !: string;
  interval !: string;
  cap !: boolean;
  createdAt !: string;
  updatedAt !: string;
  cancelledAt !: string;
  charges !: Charge[];

  static relationMappings = {
    charges: {
      relation: Model.HasManyRelation,
      modelClass: Charge,
      join: {
        from: 'mandates.id',
        to: 'charges.mandateId'
      }
    },
    transactions: {
      relation: Model.HasManyRelation,
      modelClass: MandateTransaction,
      join: {
        from: 'mandates.id',
        to: 'mandateTransactions.mandateId'
      }
    }
  }

  $beforeInsert (): void {
    this.id = v4()
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
    this.balance = 0n
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  async currentInterval (): Promise<MandateInterval> {
    const currentIntervalStartAt = this.currentIntervalStartAt()
    let interval = await MandateInterval.query().where({
      mandateId: this.id,
      startAt: currentIntervalStartAt
    }).first()

    if (!interval) {
      try {
        interval = await MandateInterval.query().insert({
          mandateId: this.id,
          startAt: currentIntervalStartAt.toISOString()
        }).first()
      } catch (error) {
        if (error instanceof UniqueViolationError) {
          interval = await MandateInterval.query().where({
            mandateId: this.id,
            startAt: currentIntervalStartAt
          }).first()
        }
        throw error
      }
    }

    return interval
  }

  currentIntervalStartAt () {
    const startAt = new Date(this.startAt)
    const now = new Date()
    const intervalSeconds = this.interval ? toSeconds(parse((this.interval))) : 0

    const intervalNumber = intervalSeconds === 0 ? 1 : Math.floor((now.getTime() / 1000 - startAt.getTime() / 1000) / intervalSeconds)

    const startAtEpoch = startAt.getTime()

    const intervalStartAtEpoch = startAtEpoch + intervalNumber * intervalSeconds * 1000
    return new Date(intervalStartAtEpoch)
  }

  nextIntervalStartAt () {
    if (!this.interval) {
      return null
    }
    const startAt = new Date(this.startAt)
    const now = new Date()
    const intervalSeconds = this.interval ? toSeconds(parse((this.interval))) : 0

    const intervalNumber = intervalSeconds === 0 ? 1 : Math.floor((now.getTime() / 1000 - startAt.getTime() / 1000) / intervalSeconds)

    const startAtEpoch = startAt.getTime()

    const intervalStartAtEpoch = startAtEpoch + (intervalNumber + 1) * intervalSeconds * 1000
    return new Date(intervalStartAtEpoch)
  }

  async intervalBalance (): Promise<bigint> {
    const currentInterval = await this.currentInterval()
    return this.amount - currentInterval.used
  }

  $formatJson (): Partial<MandateInfo> {
    return {
      id: this.id,
      name: `//${OpenPaymentsIssuer}/mandates/${this.id}`,
      description: this.description,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      amount: this.amount.toString(),
      balance: this.balance.toString(),
      startAt: this.startAt,
      expireAt: this.expireAt,
      interval: this.interval,
      cap: this.cap,
      scope: this.scope
    }
  }
}
