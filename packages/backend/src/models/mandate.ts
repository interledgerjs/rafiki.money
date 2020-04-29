import { Model } from 'objection'
import { v4 } from 'uuid'
import { Charge, ChargeInfo } from './charge'
import { MandateTransaction } from './mandateTransaction'

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
