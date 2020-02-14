import { Model } from 'objection'
import { v4 } from 'uuid'

export type InvoiceInfo = {
  id: string;
  userId: number;
  accountId: number;
  description: string;
  assetCode: string;
  assetScale: number;
  amount: string;
  balance: string;
  expireAt: string;
  createdAt: string;
  updatedAt: string;
}

export class Invoice extends Model {
  static get tableName (): string {
    return 'invoices'
  }

  id: string;
  userId: number;
  accountId: number;
  description: string;
  assetCode: string;
  assetScale: number;
  amount: bigint;
  balance: bigint;
  expireAt!: string;
  createdAt: string;
  updatedAt: string;

  $beforeInsert (): void {
    this.id = v4()
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<InvoiceInfo> {
    return {
      id: this.id,
      description: this.description,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      amount: this.amount.toString(),
      balance: this.balance.toString(),
      expireAt: this.expireAt
    }
  }
}
