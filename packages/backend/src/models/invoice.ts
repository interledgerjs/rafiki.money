import { Model } from 'objection'
import { v4 } from 'uuid'

const OpenPaymentsIssuer = process.env.OPEN_PAYMENTS_ISSUER || 'localhost:3001'

export type InvoiceInfo = {
  id: string;
  name: string;
  userId: number;
  accountId: number;
  description: string;
  assetCode: string;
  assetScale: number;
  amount: string | null;
  received: string;
  balance: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  subject: string;
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
  amount!: bigint;
  received: bigint;
  balance: bigint;
  expiresAt!: string;
  createdAt: string;
  updatedAt: string;
  subject: string;

  $beforeInsert (): void {
    this.id = v4()
    this.balance = 0n
    this.received = 0n
    this.createdAt = new Date().toISOString()
    this.updatedAt = new Date().toISOString()
  }

  $beforeUpdate (): void {
    this.updatedAt = new Date().toISOString()
  }

  $formatJson (): Partial<InvoiceInfo> {
    return {
      id: this.id,
      name: `//${OpenPaymentsIssuer}/invoices/${this.id}`,
      description: this.description,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      amount: this.amount ? this.amount.toString() : null,
      balance: this.balance.toString(),
      expiresAt: this.expiresAt,
      subject: this.subject,
      received: this.received.toString()
    }
  }
}
