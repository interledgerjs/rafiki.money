import { Model } from 'objection'
import { v4 } from 'uuid'

export type MandateInfo = {
  id: string;
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
  balance: bigint;
  startAt: string;
  expireAt!: string;
  scope !: string;
  interval!: string;
  cap!: boolean;
  createdAt: string;
  updatedAt: string;
  cancelledAt!: string;

  $beforeInsert (): void {
    this.id = v4()
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<MandateInfo> {
    return {
      id: this.id,
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
